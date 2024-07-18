const min = Math.min
const max = Math.max
const floor = Math.floor
const DIM = 2
const ROOM = 8

const Tile = function (x0, y0, width, height) {
  // A quad-tree tile structure.
  //
  // Parameters:
  //   x0
  //   y0
  //   width
  //   height
  //

  // DEBUG
  if (Math.abs(width) < 0.0000001) {
    throw new Error('zero width')
  }
  if (Math.abs(height) < 0.0000001) {
    throw new Error('zero height')
  }

  this.x = x0
  this.y = y0
  this.w = width
  this.h = height
  this.leaf = true
  this.circles = []
  this.subtiles = []
  this.size = 0
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

  // DEBUG Skip circles fully outside the tile.
  if (xmaxNorm < 0 || xminNorm >= 1 || ymaxNorm < 0 || yminNorm >= 1) {
    console.warn('The circle is outside the tile and thus skipped: ', c)
    return
  }

  // We will add the circle. Either here or in subtiles.
  this.size += 1

  // If still a leaf, just push. If too large, push and divide.
  if (this.leaf) {
    this.circles.push(c)
    if (this.circles.length > ROOM) {
      this.divide()
    }
    return
  }

  // Find subtiles. Do not go over the tile boundary.
  const xmin = max(floor(DIM * xminNorm), 0)
  const xmax = min(floor(DIM * xmaxNorm), DIM - 1)
  const ymin = max(floor(DIM * yminNorm), 0)
  const ymax = min(floor(DIM * ymaxNorm), DIM - 1)
  // Add the circle to all subtiles, except when it occupies them all,
  // in which case keep the circle at this tile.
  if (xmax - xmin >= DIM - 1 && ymax - ymin >= DIM - 1) {
    // The circle occupies all tiles. Keep it here.
    this.circles.push(c)
  } else {
    // Add to subset of subtiles.
    for (let y = ymin; y <= ymax; y += 1) {
      for (let x = xmin; x <= xmax; x += 1) {
        // Add the circle to all these subtiles.
        const t = y * DIM + x
        this.subtiles[t].add(c)
      }
    }
  }
}

Tile.prototype.collide = function (c) {
  // Test if the circle collides with another circle.
  //

  // For top circles, just test collisions in linear manner.
  const n = this.circles.length
  let b, dx, dy, rr
  for (let i = 0; i < n; i += 1) {
    b = this.circles[i]
    dx = c.x - b.x
    dy = c.y - b.y
    rr = c.r + b.r
    if (dx * dx + dy * dy < rr * rr) {
      return true
    }
  }

  if (this.leaf) {
    // No subtiles yet.
    return false
  }

  // Find a colliding subtile.

  // Normalized circle coordinates on the tile.
  const xminNorm = (c.x - c.r - this.x) / this.w
  const xmaxNorm = (c.x + c.r - this.x) / this.w
  const yminNorm = (c.y - c.r - this.y) / this.h
  const ymaxNorm = (c.y + c.r - this.y) / this.h

  // Find overlapping subtiles. Do not go over the tile boundary.
  const xmin = max(floor(DIM * xminNorm), 0)
  const xmax = min(floor(DIM * xmaxNorm), DIM - 1)
  const ymin = max(floor(DIM * yminNorm), 0)
  const ymax = min(floor(DIM * ymaxNorm), DIM - 1)

  for (let y = ymin; y <= ymax; y += 1) {
    for (let x = xmin; x <= xmax; x += 1) {
      // Check all these subtiles.
      const t = y * DIM + x
      if (this.subtiles[t].collide(c)) {
        return true
      }
    }
  }

  return false
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
  const covers = []
  const n = this.circles.length
  for (let i = 0; i < n; i += 1) {
    const c = this.circles[i]
    const xminNorm = (c.x - c.r - this.x) / this.w
    const xmaxNorm = (c.x + c.r - this.x) / this.w
    const yminNorm = (c.y - c.r - this.y) / this.h
    const ymaxNorm = (c.y + c.r - this.y) / this.h
    const xmin = max(floor(DIM * xminNorm), 0)
    const xmax = min(floor(DIM * xmaxNorm), DIM - 1)
    const ymin = max(floor(DIM * yminNorm), 0)
    const ymax = min(floor(DIM * ymaxNorm), DIM - 1)
    // except when it occupies them all,
    // in which case keep the circle at this tile.
    if (xmax - xmin >= DIM - 1 && ymax - ymin >= DIM - 1) {
      // The circle occupies all tiles. Keep it here.
      covers.push(c)
    } else {
      for (let y = ymin; y <= ymax; y += 1) {
        for (let x = xmin; x <= xmax; x += 1) {
          // Copy the circle to all these subtiles.
          const t = y * DIM + x
          this.subtiles[t].add(c)
        }
      }
    }
  }

  this.circles = covers
  this.leaf = false
}

Tile.prototype.overlap = function (c) {
  // Find circles that overlap c.
  //
  // Return:
  //   an array of circle2
  //
  const colliders = []

  // TODO OPTIMIZE if c covers a tile in full
  // skip all test and return all circles that touch the tile.

  // For top circles, just test collisions in linear manner.
  const n = this.circles.length
  let b, dx, dy, rr
  for (let i = 0; i < n; i += 1) {
    b = this.circles[i]
    dx = c.x - b.x
    dy = c.y - b.y
    rr = c.r + b.r
    if (dx * dx + dy * dy < rr * rr) {
      colliders.push(b)
    }
  }

  if (this.leaf) {
    // No subtiles yet.
    return colliders
  }

  // Reduce overlap from the subtiles.

  // Normalized circle coordinates on the tile.
  const xminNorm = (c.x - c.r - this.x) / this.w
  const xmaxNorm = (c.x + c.r - this.x) / this.w
  const yminNorm = (c.y - c.r - this.y) / this.h
  const ymaxNorm = (c.y + c.r - this.y) / this.h

  // Find overlapping subtiles. Do not go over the tile boundary.
  const xmin = max(floor(DIM * xminNorm), 0)
  const xmax = min(floor(DIM * xmaxNorm), DIM - 1)
  const ymin = max(floor(DIM * yminNorm), 0)
  const ymax = min(floor(DIM * ymaxNorm), DIM - 1)

  for (let y = ymin; y <= ymax; y += 1) {
    for (let x = xmin; x <= xmax; x += 1) {
      // Check all these subtiles.
      const t = y * DIM + x
      const lap = this.subtiles[t].overlap(c)
      // Combine.
      colliders.push(...lap)
    }
  }

  // Remove duplicates.
  return Array.from(new Set(colliders))
}

Tile.prototype.depth = function () {
  // Measure depth. This requires full subtile tree search.
  //
  if (this.leaf || this.size === 0) {
    return 0
  }

  const n = this.subtiles.length
  let maxDepth = 0
  let d
  for (let i = 0; i < n; i += 1) {
    d = this.subtiles[i].depth()
    if (d > maxDepth) {
      maxDepth = d
    }
  }

  return maxDepth + 1
}

module.exports = Tile
