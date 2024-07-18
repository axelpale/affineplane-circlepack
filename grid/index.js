const Tile = require('./tile')

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
}

CircleGrid.prototype.add = function (c) {
  // Add a circle to the grid index.
  //
  const index = this.index

  // Tile range.
  const xmin = Math.floor((c.x - c.r) / this.tilesize)
  const xmax = Math.floor((c.x + c.r) / this.tilesize)
  const ymin = Math.floor((c.y - c.r) / this.tilesize)
  const ymax = Math.floor((c.y + c.r) / this.tilesize)

  // Add circle to the tiles.

  // Fill the gaps between coordinates to fill also tiles inside the circle.
  for (let x = xmin; x <= xmax; x += 1) {
    for (let y = ymin; y <= ymax; y += 1) {
      if (index[x]) {
        if (index[x][y]) {
          // The tile exists.
          index[x][y].add(c)
        } else {
          // Create the tile.
          index[x][y] = new Tile()
          index[x][y].add(c)
        }
      } else {
        // Create grid column.
        index[x] = []
        // Create the tile.
        index[x][y] = new Tile()
        index[x][y].add(c)
      }
    }
  }
}

CircleGrid.prototype.overlap = function (c) {
  // Find circles that overlap with the circle c.
  //
  // Return
  //   an array of circle2
  //

  // Tile range of the circle.
  const xmin = Math.floor((c.x - c.r) / this.tilesize)
  const xmax = Math.floor((c.x + c.r) / this.tilesize)
  const ymin = Math.floor((c.y - c.r) / this.tilesize)
  const ymax = Math.floor((c.y + c.r) / this.tilesize)

  const colliders = []

  for (let x = xmin; x <= xmax; x += 1) {
    for (let y = ymin; y <= ymax; y += 1) {
      if (this.index[x] && this.index[x][y]) {
        const tile = this.index[x][y]
        const lap = tile.overlap(c)
        colliders.push(...lap)
      }
    }
  }

  return colliders
}

// TODO optimize unipoint insertion, keep the default position in cache

module.exports = CircleGrid
