const test = require('tape')
const CircleGrid = require('./index')

test('basic grid add', (t) => {
  const grid = new CircleGrid(10)

  const c0 = { x: 0, y: 0, r: 1 }
  const c1 = { x: 2, y: 2, r: 1 }
  const c2 = { x: 4, y: 4, r: 1 }
  grid.add(c0)
  grid.add(c1)
  grid.add(c2)

  t.equal(grid.size, 3, 'should count circles')

  const lap0 = grid.overlap({ x: 1, y: 1, r: 1 })
  t.equal(lap0.length, 2, 'should hit the first two')

  const lap1 = grid.overlap({ x: 5, y: 3, r: 2 })
  t.equal(lap1.length, 1, 'should hit one')
  t.equal(lap1[0], c2, 'should hit the last')

  t.equal(grid.collide({ x: 5, y: 3, r: 2 }), true, 'should hit one')
  t.equal(grid.collide({ x: 0, y: 2, r: 1 }), false, 'should hit none')

  t.end()
})

test('huge node', (t) => {
  const grid = new CircleGrid(10)
  const big = { x: 0, y: 0, r: 1000000 }
  grid.add(big)

  t.equal(grid.size, 1, 'should allow the big circle')
  t.equal(grid.tiles, 0, 'should not create tiles for it')

  t.end()
})
