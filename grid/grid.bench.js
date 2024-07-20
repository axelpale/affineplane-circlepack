const CircleGrid = require('./index')
const random = Math.random
const powerlaw = (xmin, alpha) => xmin * (1 - random()) ** (-1 / (alpha - 1))

// Generate 1M circles
const n = 1000000
// Test collision 100k times
const m = 100000

const MAX_RADIUS = 10

// Define area to be filled with circles and their radii.
const gen = () => {
  const x = random() * 1000 - 300
  const y = random() * 1000 - 300
  // const r = random() * MAX_RADIUS // Uniform radius distribution -> medium to large sized dominate
  const r = powerlaw(1, 2.8) // Power-law distribution -> small dominate but very large ones possible
  if (r > 1000) console.log('Note: circle with large radius:', r)
  return { x, y, r }
}

console.log('Generating...')
console.time('generation')

const grid = new CircleGrid(MAX_RADIUS)
for (let i = 0; i < n; i += 1) {
  const c = gen()
  grid.add(c)
}

console.timeEnd('generation')
console.log('Circles generated and added:', n)
console.log('Average circles per tile:', Math.round(grid.size / grid.tiles))
console.time('depth')

const depth = grid.depth()

console.timeEnd('depth')
console.log('Grid depth:', depth)
console.log('Checking collisions...')
console.time('collisions')

let hits = 0
for (let i = 0; i < m; i += 1) {
  const c = gen()
  if (grid.collide(c)) {
    hits += 1
  }
}

console.timeEnd('collisions')
console.log('Collisions checked:', m)
console.log('Hits found:', hits)
console.log('Finding overlaps...')
console.time('overlaps')

let found = 0
for (let i = 0; i < m; i += 1) {
  const c = gen()
  const lap = grid.overlap(c)
  found += lap.length
}

console.timeEnd('overlaps')

console.log('Overlaps performed:', m)
console.log('Circles found per overlap:', Math.round(found / m))
