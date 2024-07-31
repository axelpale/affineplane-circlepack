const test = require('tape')
const pack = require('./index')

const circles = [
  { x: 0, y: 0, r: 1 },
  { x: 0, y: 0, r: 2 },
  { x: 0, y: 0, r: 3, msg: 'hello' },
  { x: 2, y: 1, r: 5 },
  { x: 2, y: 2, r: 3 },
  { x: 2, y: 3, r: 1, msg: 'universe' }
]

test('synchronic pack', (t) => {
  const packed = pack(circles)

  t.equal(packed.length, 6, 'should have equal number of circles')
  t.ok(packed.some(c => c.msg === 'hello'), 'should carry extra properties')
  t.ok(packed.some(c => c.msg === 'universe'), 'should carry extra properties')

  t.end()
})

test('asynchronic pack', (t) => {
  let updates = 0

  pack(circles, (c) => {
    updates += 1
  }, () => {
    t.equal(updates, 6, 'should call update for each circle')

    t.end()
  }, {
    batchSize: 1
  })
})
