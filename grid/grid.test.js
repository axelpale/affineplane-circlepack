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

  const lap0 = grid.overlap({ x: 1, y: 1, r: 1 })
  t.equal(lap0.length, 2, 'should hit the first two')

  const lap1 = grid.overlap({ x: 5, y: 3, r: 2 })
  t.equal(lap1.length, 1, 'should hit one')
  t.equal(lap1[0], c2, 'should hit the last')

  t.end()
})
