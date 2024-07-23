const estimateInnerRadius = require('./estimateInnerRadius')
const test = require('tape')

test('basic estimateInnerRadius', (t) => {
  // Trivial zero circles
  const r0 = estimateInnerRadius({ x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 })
  t.equal(r0, 0, 'should handle zeros')

  // Basic
  const r1 = estimateInnerRadius({ x: 0, y: 0, r: 2 }, { x: 9, y: -2, r: 3 }, { x: 6, y: 11, r: 5 })
  // Read rough limits from a drawing.
  t.ok(r1 > 3, 'should be larger than three')
  t.ok(r1 < 4, 'should be smaller than four')

  // Two concentric zero circles with gap to a non-zero circle.
  const r2 = estimateInnerRadius({ x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }, { x: 6, y: 0, r: 2 })
  t.ok(r2 > 1.9, 'should be larger than half of the smallest distance')
  t.ok(r2 < 3, 'should be smaller the half of the longest distance between center points')

  // Concentric circles with non-zero radius.
  const r3 = estimateInnerRadius({ x: 0, y: 0, r: 2 }, { x: 0, y: 0, r: 2 }, { x: 0, y: 0, r: 2 })
  t.equal(r3, 0, 'should find only zero radius')

  // Overlapping circles with no gap
  // const r4 = estimateInnerRadius({ x: 0, y: 0, r: 1 }, { x: 1, y: 0, r: 1 }, { x: 0.5, y: 1, r: 1 })
  // t.equal(r4, 0, 'should find only zero radius')

  t.end()
})
