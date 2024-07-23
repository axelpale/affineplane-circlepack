const innerRadius = require('./innerRadius')
const test = require('tape')

test('basic innerRadius', (t) => {
  const r0 = innerRadius(0, 0, 0)
  t.equal(r0, 0, 'should handle zeros')

  const r1 = innerRadius(2, 2, 2)
  // Read rough limits from a drawing.
  t.ok(r1 > 0.2, 'should be larger than tenth')
  t.ok(r1 < 0.4, 'should be smaller than fifth')

  const r2 = innerRadius(6, 3, 1.5)
  // Read rough limits from a drawing.
  t.ok(r2 > 0.4, 'should be larger than lower bound')
  t.ok(r2 < 0.5, 'should be smaller than upper bound')

  t.end()
})
