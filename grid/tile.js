const min = Math.min
const max = Math.max
const abs = Math.abs
const floor = Math.floor
const DIM = 2

const Tile = function (x0, y0, width, height, room) {
  // A quad-tree tile structure.
  //
  // Parameters:
  //   x0
  //     a number. The top-left corner x-coordinate.
  //   y0
  //     a number. The top-left corner y-coordinate.
  //   width
  //     a number. The tile width.
  //   height
  //     a number. The tile height.
  //   room
  //     an integer. The number of items the tile can hold before division to subtiles.
  //

  // DEBUG
  if (abs(width) < 0.0000001) {
    throw new Error('zero width')
  }
  if (abs(height) < 0.0000001) {
    throw new Error('zero height')
  }

  // Hierarchy
  this.room = room
  // Box
  this.x = x0
  this.y = y0
  this.w = width
  this.h = height
  // Bounding circle
  this.cx = x0 + width / 2
  this.cy = y0 + height / 2
  this.cr = Math.sqrt(width * width + height * height) / 2
  // Children
  this.leaf = true
  this.circles = []
  this.subtiles = []
  this.size = 0
  // Precompute normalizers
  this.nw = DIM / width
  this.nh = DIM / height
}

Tile.prototype.add = function (c) {
  // Add a circle to the tile.
  // The addition might be propagated to subtiles.
  //
  // Parameters:
  //   c
  //     a circle2
  //

  // Normalized circle coordinates on the tile.
  const xminNorm = (c.x - c.r - this.x) * this.nw
  const xmaxNorm = (c.x + c.r - this.x) * this.nw
  const yminNorm = (c.y - c.r - this.y) * this.nh
  const ymaxNorm = (c.y + c.r - this.y) * this.nh

  // DEBUG Skip circles fully outside the tile.
  if (xmaxNorm < 0 || xminNorm >= DIM || ymaxNorm < 0 || yminNorm >= DIM) {
    console.warn('The circle is outside the tile and thus skipped: ', c)
    return
  }

  // We will add the circle. Either here or in subtiles.
  this.size += 1

  // If still a leaf, just push. If too large, push and divide.
  if (this.leaf) {
    this.circles.push(c)
    if (this.circles.length > this.room) {
      this.divide()
    }
    return
  }

  // Find subtiles. Do not go over the tile boundary.
  const xmin = max(floor(xminNorm), 0)
  const xmax = min(floor(xmaxNorm), DIM - 1)
  const ymin = max(floor(yminNorm), 0)
  const ymax = min(floor(ymaxNorm), DIM - 1)
  // Add the circle to all subtiles, except when it occupies them all,
  // in which case keep the circle at this tile.
  if (xmax - xmin >= DIM - 1 && ymax - ymin >= DIM - 1) {
    // The circle occupies all tiles. Keep it here.
    this.circles.push(c)
  } else {
    // Add the circle to subset of subtiles.
    for (let y = ymin; y <= ymax; y += 1) {
      for (let x = xmin; x <= xmax; x += 1) {
        const t = y * DIM + x
        this.subtiles[t].add(c)
      }
    }
  }
}

Tile.prototype.collect = function (unique) {
  // Collect and return all circles in the tile and its subtiles.
  //
  // Parameters:
  //   unique
  //     optional boolean, default is false. Set true to return unique circles (slower).
  //
  // Return:
  //   an array of circle2
  //
  const bag = []
  // Collect local circles.
  bag.push(...this.circles)
  // Collect circles in subtiles if any.
  for (let t = 0; t < this.subtiles.length; t += 1) {
    const subs = this.subtiles[t].collect()
    bag.push(...subs)
  }

  if (unique) {
    // Remove duplicates.
    return Array.from(new Set(bag))
  }
  return bag
}

Tile.prototype.collide = function (c) {
  // Test if the circle collides with another circle.
  //
  // Parameters:
  //   c
  //     a circle2
  //
  // Return:
  //   a boolean
  //

  // For top circles, just test collisions in linear manner.
  const n = this.circles.length
  let b, dx, dy, rr
  for (let i = 0; i < n; i += 1) {
    b = this.circles[i]
    dx = c.x - b.x
    dy = c.y - b.y
    rr = c.r + b.r
    if (abs(dx) + abs(dy) < rr + rr && dx * dx + dy * dy < rr * rr) {
      return true
    }
  }

  if (this.leaf) {
    // No subtiles yet.
    return false
  }

  // Find a colliding subtile.

  // Normalized circle coordinates on the tile.
  const xminNorm = (c.x - c.r - this.x) * this.nw
  const xmaxNorm = (c.x + c.r - this.x) * this.nw
  const yminNorm = (c.y - c.r - this.y) * this.nh
  const ymaxNorm = (c.y + c.r - this.y) * this.nh

  // Find overlapping subtiles. Do not go over the tile boundary.
  const xmin = max(floor(xminNorm), 0)
  const xmax = min(floor(xmaxNorm), DIM - 1)
  const ymin = max(floor(yminNorm), 0)
  const ymax = min(floor(ymaxNorm), DIM - 1)

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

  // Create the subtiles.
  const subw = this.w / DIM
  const subh = this.h / DIM
  for (let y = 0; y < DIM; y += 1) {
    for (let x = 0; x < DIM; x += 1) {
      this.subtiles.push(new Tile(
        this.x + x * subw,
        this.y + y * subh,
        subw,
        subh,
        this.room
      ))
    }
  }

  // Find subtiles for every circle.
  const covers = []
  const n = this.circles.length
  for (let i = 0; i < n; i += 1) {
    const c = this.circles[i]
    const xminNorm = (c.x - c.r - this.x) * this.nw
    const xmaxNorm = (c.x + c.r - this.x) * this.nw
    const yminNorm = (c.y - c.r - this.y) * this.nh
    const ymaxNorm = (c.y + c.r - this.y) * this.nh
    const xmin = max(floor(xminNorm), 0)
    const xmax = min(floor(xmaxNorm), DIM - 1)
    const ymin = max(floor(yminNorm), 0)
    const ymax = min(floor(ymaxNorm), DIM - 1)
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

Tile.prototype.overlap = function (c, unique) {
  // Find circles that overlap c.
  //
  // Parameters:
  //   c
  //     a circle2
  //   unique
  //     optional boolean, default is false. Set true to return unique circles (slower).
  //
  // Return:
  //   an array of circle2
  //

  // Optimization: test if the circle covers the tile in full.
  const dcx = this.cx - c.x
  const dcy = this.cy - c.y
  const dcr = this.cr - c.r
  if (dcr <= 0 && dcx * dcx + dcy * dcy <= dcr * dcr) {
    // The tile is fully inside the circle.
    // Because all the circles of the tile overlap the tile,
    // all those circles overlap the circle too.
    // Therefore skip all collision checks and return all circles.
    return this.collect()
  }

  const colliders = []

  // For top circles, just test collisions in linear manner.
  const n = this.circles.length
  let b, dx, dy, rr
  for (let i = 0; i < n; i += 1) {
    b = this.circles[i]
    dx = c.x - b.x
    dy = c.y - b.y
    rr = c.r + b.r
    if (abs(dx) + abs(dy) < rr + rr && dx * dx + dy * dy < rr * rr) {
      colliders.push(b)
    }
  }

  if (this.leaf) {
    // No subtiles yet.
    return colliders
  }

  // Find overlapping circles in the subtiles.

  // Normalized circle coordinates on the tile.
  const xminNorm = (c.x - c.r - this.x) * this.nw
  const xmaxNorm = (c.x + c.r - this.x) * this.nw
  const yminNorm = (c.y - c.r - this.y) * this.nh
  const ymaxNorm = (c.y + c.r - this.y) * this.nh

  // Find overlapping subtiles. Do not go over the tile boundary.
  const xmin = max(floor(xminNorm), 0)
  const xmax = min(floor(xmaxNorm), DIM - 1)
  const ymin = max(floor(yminNorm), 0)
  const ymax = min(floor(ymaxNorm), DIM - 1)

  for (let y = ymin; y <= ymax; y += 1) {
    for (let x = xmin; x <= xmax; x += 1) {
      // Check all these subtiles.
      const t = y * DIM + x
      const lap = this.subtiles[t].overlap(c)
      // Combine.
      colliders.push(...lap)
    }
  }

  if (unique) {
    // Remove duplicates.
    return Array.from(new Set(colliders))
  }
  return colliders
}

Tile.prototype.depth = function () {
  // Measure depth. This requires full subtile tree search.
  //
  // Return:
  //   an integer
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
