const test = require('tape')
const CircleGraph = require('./index')

test('basic graph operations', (t) => {
  const g = new CircleGraph()

  const c0 = { i: 0 }
  const c1 = { i: 1 }
  const c2 = { i: 2 }
  const c3 = { i: 3 }

  const e01 = g.addEdge(c0, c1)
  const e12 = g.addEdge(c1, c2)
  const e20 = g.addEdge(c2, c0)
  const e03 = g.addEdge(c0, c3) // escapes triangle

  const eds1 = g.getEdges(c1)
  t.equal(eds1.length, 2, 'should have correct number of edges')
  t.equal(eds1[0], e01, 'should follow insertion order')
  t.equal(eds1[1], e12, 'should follow insertion order')

  const eds0 = g.getEdges(c0)
  t.equal(eds0.length, 3, 'should have correct number of edges')

  const ne0 = g.edgeNeighborhood([c0])
  t.equal(ne0.length, 3, 'should match incident edges')
  t.equal(ne0[0], e01, 'should follow insertion order')

  const ne12 = g.edgeNeighborhood([c1, c2])
  t.equal(ne12.length, 3, 'should have correct number of edges')
  t.ok(ne12.indexOf(e20) >= 0, 'should include e20 edge')
  t.equal(ne12.indexOf(e03), -1, 'should exclude e03 edge')

  t.end()
})

test('graph add clique of edges', (t) => {
  const g = new CircleGraph()

  const c0 = { i: 0 }
  const c1 = { i: 1 }
  const c2 = { i: 2 }

  g.addEdges([c0, c1, c2])

  t.ok(g.edges[0][1], 'edge 01 exists')
  t.ok(g.edges[1][0], 'edge 10 exists')

  t.ok(g.edges[0][2], 'edge 02 exists')
  t.ok(g.edges[2][0], 'edge 20 exists')

  t.ok(g.edges[1][2], 'edge 12 exists')
  t.ok(g.edges[2][1], 'edge 21 exists')

  t.end()
})
