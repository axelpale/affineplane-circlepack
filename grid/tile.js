const min = Math.min
const max = Math.max
const floor = Math.floor
const DIM = 2
const ROOM = 8

const Tile = function (x0, y0, width, height) {
  this.x = x0
  this.y = y0
  this.w = width
  this.h = height
  this.leaf = true
  this.circles = []
  this.subtiles = []
}

Tile.prototype.add = function (c) {
  // Add a circle to the tile.
  // The addition might be propagated to subtiles.
  //

  // Normalized circle coordinates on the tile.
  const xminNorm = (c.x - c.r - this.x) / this.w
  const xmaxNorm = (c.x + c.r - this.x) / this.w
  const yminNorm = (c.y - c.r - this.y) / this.h
  const ymaxNorm = (c.y + c.r - this.y) / this.h

  // DEBUG Skip circles outside the tile.
  if (xmaxNorm < 0 || xminNorm >= 1 || ymaxNorm < 0 || yminNorm >= 1) {
    console.warn('The circle is outside the tile and thus skipped: ', c)
    return
  }

  // If still a leaf, just push. If too large, push and divide.
  if (this.leaf) {
    this.circles.push(c)
    if (this.circles.length > ROOM) {
      this.divide()
    }
    return
  }

  // Find subtiles. Do not go over the tile boundary.
  const xmin = max(floor(DIM * xminNorm), this.x)
  const xmax = min(floor(DIM * xmaxNorm), this.x + this.w)
  const ymin = max(floor(DIM * yminNorm), this.y)
  const ymax = min(floor(DIM * ymaxNorm), this.y + this.h)
  for (let y = ymin; y <= ymax; y += 1) {
    for (let x = xmin; x <= xmax; x += 1) {
      // Add the circle to all these subtiles.
      const t = y * DIM + x
      this.subtiles[t].add(c)
    }
  }
}

Tile.prototype.divide = function () {
  // Cut the tile in four subtiles and move the circles.
  //
  if (!this.leaf) {
    // Already divided.
    return
  }

  const subw = this.w / DIM
  const subh = this.h / DIM
  for (let y = 0; y < DIM; y += 1) {
    for (let x = 0; x < DIM; x += 1) {
      this.subtiles.push(new Tile(
        this.x + x * subw,
        this.y + y * subh,
        subw,
        subh
      ))
    }
  }

  // Find subtiles for every circle.
  const n = this.circles.length
  for (let i = 0; i < n; i += 1) {
    const c = this.circles[i]
    const xminNorm = (c.x - c.r - this.x) / this.w
    const xmaxNorm = (c.x + c.r - this.x) / this.w
    const xmin = max(floor(DIM * xminNorm), this.x)
    const xmax = min(floor(DIM * xmaxNorm), this.x + this.w)
    const yminNorm = (c.y - c.r - this.y) / this.h
    const ymaxNorm = (c.y + c.r - this.y) / this.h
    const ymin = max(floor(DIM * yminNorm), this.y)
    const ymax = min(floor(DIM * ymaxNorm), this.y + this.h)
    for (let y = ymin; y <= ymax; y += 1) {
      for (let x = xmin; x <= xmax; x += 1) {
        // Copy the circle to all these subtiles.
        const t = y * DIM + x
        this.subtiles[t].add(c)
      }
    }
  }

  this.circles = []
  this.leaf = false
}

Tile.prototype.overlap = function (c) {
  // Find circles that overlap c.
  //
  // Return:
  //   an array of circle2
  //
  let colliders = []

  if (this.leaf) {
    // No subtiles yet. Just test collisions in linear manner.
    const n = this.circles.length
    let b, dx, dy
    for (let i = 0; i < n; i += 1) {
      b = this.circles[i]
      dx = c.x - b.x
      dy = c.y - b.y
      rr = c.r + b.r
      if (dx * dx + dy * dy < rr * rr) {
        colliders.push(b)
      }
    }

    return colliders
  }
  // Reduce overlap from the subtiles.

  // Normalized circle coordinates on the tile.
  const xminNorm = (c.x - c.r - this.x) / this.w
  const xmaxNorm = (c.x + c.r - this.x) / this.w
  const yminNorm = (c.y - c.r - this.y) / this.h
  const ymaxNorm = (c.y + c.r - this.y) / this.h

  // Find overlapping subtiles. Do not go over the tile boundary.
  const xmin = max(floor(DIM * xminNorm), this.x)
  const xmax = min(floor(DIM * xmaxNorm), this.x + this.w)
  const ymin = max(floor(DIM * yminNorm), this.y)
  const ymax = min(floor(DIM * ymaxNorm), this.y + this.h)

  for (let y = ymin; y <= ymax; y += 1) {
    for (let x = xmin; x <= xmax; x += 1) {
      // Check all these subtiles.
      const t = y * DIM + x
      const lap = this.subtiles[t].overlap(c)
      // Combine.
      colliders.push(...lap)
    }
  }
  // TODO maybe large circles should be kept high
  // to avoid duplicate and potentially numerous checks in the subtiles.

  // Remove duplicates.
  return Array.from(new Set(colliders))
}

module.exports = Tile
