const CircleGrid = require('./index')
const random = Math.random

// Generate 1M circles
const n = 1000000
// Test collision 1M times
const m = 1000000

// Area
const gen = () => {
  const x = random() * 1000 - 300
  const y = random() * 1000 - 300
  const r = random() * 20
  return { x, y, r }
}

console.log('Generating...')
console.time('generation')

const grid = new CircleGrid(20)
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
console.log('Circles found:', found)
