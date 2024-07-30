const Tile = require('./tile')
const ROOM = 2048 // circles per tile

const CircleGrid = function (maxRadius) {
  // An infinite grid where each cell is quadtree structure.
  // Intended for circle collision checks.
  //
  // Parameters:
  //   maxRadius
  //     a number, the size of the largest circle.
  //

  // Grid eye size.
  const circlesPerTile = 16
  const diameter = maxRadius * 2
  this.tilesize = Math.ceil(diameter * Math.sqrt(circlesPerTile))

  // Save grid here. Use object to support negative indices.
  this.index = {}
  // Save large circles separately. Otherwise even one circle could generate a million tiles.
  this.large = []
  // Total number of circles stored.
  this.size = 0
  // Total number of top-level tiles created.
  this.tiles = 0
}

CircleGrid.prototype.add = function (c) {
  // Add a circle to the grid index.
  //
  const index = this.index
  const s = this.tilesize

  // Tile range.
  const xmin = Math.floor((c.x - c.r) / s)
  const xmax = Math.floor((c.x + c.r) / s)
  const ymin = Math.floor((c.y - c.r) / s)
  const ymax = Math.floor((c.y + c.r) / s)

  // We will add the circle.
  this.size += 1

  // Detect if the circle is large.
  if (xmax - xmin > 2 && ymax - ymin > 2) {
    this.large.push(c)
    return
  }

  // Fill the gaps between coordinates to fill also tiles inside the circle.
  for (let x = xmin; x <= xmax; x += 1) {
    if (!index[x]) {
      // Create the grid column
      index[x] = {}
    }
    // Ensure the tiles.
    for (let y = ymin; y <= ymax; y += 1) {
      if (index[x][y]) {
        // The tile exists.
        index[x][y].add(c)
      } else {
        // Create the tile.
        this.tiles += 1
        index[x][y] = new Tile(x * s, y * s, s, s, ROOM)
        index[x][y].add(c)
      }
    }
  }
}

CircleGrid.prototype.collide = function (c) {
  // Test if the circle overlaps with one or more circles.
  //
  // Parameter:
  //   c
  //     a circle2
  //
  // Return:
  //   a boolean, true if the circle collides with another circle.
  //
  const index = this.index
  const s = this.tilesize

  // Tile range of the circle.
  const xmin = Math.floor((c.x - c.r) / s)
  const xmax = Math.floor((c.x + c.r) / s)
  const ymin = Math.floor((c.y - c.r) / s)
  const ymax = Math.floor((c.y + c.r) / s)

  // Test against the large before diving into tiles.
  const nl = this.large.length
  let cl, dx, dy, rr
  for (let i = 0; i < nl; i += 1) {
    cl = this.large[i]
    dx = c.x - cl.x
    dy = c.y - cl.y
    rr = c.r + cl.r
    if (dx * dx + dy * dy < rr * rr) {
      return true
    }
  }

  for (let x = xmin; x <= xmax; x += 1) {
    if (index[x]) {
      for (let y = ymin; y <= ymax; y += 1) {
        if (index[x][y]) {
          const tile = index[x][y]
          if (tile.collide(c)) {
            // Exit at the first collision.
            return true
          }
        }
      }
    }
  }

  return false
}

CircleGrid.prototype.overlap = function (c) {
  // Find circles that overlap with the circle c.
  //
  // Return
  //   an array of circle2
  //
  const index = this.index
  const s = this.tilesize

  // Tile range of the circle.
  const xmin = Math.floor((c.x - c.r) / s)
  const xmax = Math.floor((c.x + c.r) / s)
  const ymin = Math.floor((c.y - c.r) / s)
  const ymax = Math.floor((c.y + c.r) / s)

  const colliders = []

  // Collect the large before diving into tiles.
  const nl = this.large.length
  let cl, dx, dy, rr
  for (let i = 0; i < nl; i += 1) {
    cl = this.large[i]
    dx = c.x - cl.x
    dy = c.y - cl.y
    rr = c.r + cl.r
    if (dx * dx + dy * dy < rr * rr) {
      colliders.push(cl)
    }
  }

  for (let x = xmin; x <= xmax; x += 1) {
    if (index[x]) {
      for (let y = ymin; y <= ymax; y += 1) {
        if (index[x][y]) {
          const tile = index[x][y]
          const lap = tile.overlap(c)
          colliders.push(...lap)
        }
      }
    }
  }

  // Finding overlaps can return duplicates.
  // Remove duplicates to return unique circles.
  const unique = Array.from(new Set(colliders))
  return unique
}

CircleGrid.prototype.depth = function () {
  // Find greatest tile depth.
  //
  // Return
  //   an integer
  //
  // Complexity: O(n*log(n))
  //
  let maxDepth = 0
  const columns = Object.values(this.index)
  for (let col = 0; col < columns.length; col += 1) {
    const tiles = Object.values(columns[col])
    for (let t = 0; t < tiles.length; t += 1) {
      const d = tiles[t].depth()
      if (d > maxDepth) {
        maxDepth = d
      }
    }
  }

  return maxDepth
}

// TODO optimize unipoint insertion, keep the default position in cache

module.exports = CircleGrid
