const nearestTangent = require('./nearestTangent')
const test = require('tape')

test('basic nearestTangent', (t) => {
  const tangent = nearestTangent({ x: 1, y: 0, r: 1 }, { x: 0, y: 0, r: 1 })
  t.deepEqual(tangent, { x: 2, y: 0, r: 1 }, 'should find tangent')

  t.end()
})
