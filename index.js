const affineplane = require('affineplane')
const CircleGrid = require('./grid')
const CircleGraph = require('./graph')
const BinaryHeap = require('./heap')
const nearestTangent = require('./circle/nearestTangent')
const pointDistance = affineplane.point2.distance

const findFreePosition = (grid, graph, c0) => {
  // Find a good tight position for the circle c0
  // as close to the original location as possible.

  // Rank tangent circle candidates by distance.
  const candidateHeap = new BinaryHeap()
  const edgeHeap = new BinaryHeap()
  const visitedEdges = []

  let winner = null

  candidateHeap.push(c0, 0)
  while (candidateHeap.size > 0) {
    // Draw next candidate.
    const candidate = candidateHeap.pop()
    // Find colliding circles.
    const overlap = grid.overlap(candidate)
    // No obstacles.
    if (overlap.length === 0) {
      winner = candidate // WINNER!
      break
    }
    // Just one obstacle. Cannot yet create edge.
    if (overlap.length === 1) {
      const near = nearestTangent(candidate, overlap[0])
      // Candidate must be a bit larger to ensure it will hit to overlap.
      near.r *= 1.0001
      // OPTIMIZATION? Use d*d? Distance of zero for immediate pop?
      const d = pointDistance(c0, candidate)
      candidateHeap.push(near, d)
      continue
    }
    // Else the candidate overlaps two or more circles.
    // Ensure these are connected.
    const edges = graph.clique(overlap)
    // Add non-visited edges to further processing.
    edges.forEach(edge => {
      if (!edge.visited) {
        // Harden each edge with respect to the clique.
        for (let i = 0; i < overlap.length; i += 1) {
          edge.harden(overlap[i]) // too much repetition?
        }
        // Send to tangent circle generation.
        const d = pointDistance(c0, edge.middle)
        edgeHeap.push(edge, d)
      }
    })

    overlap.forEach(hit => {
      if (candidate.parentEdge) {
        const edge = candidate.parentEdge
        edge.limit(hit)
        const leftEdge = graph.addEdge(edge.c0, hit)
        const rightEdge = graph.addEdge(edge.c1, hit)
        // Optimization: limit immediately to avoid unnecessary grid queries.
        leftEdge.limit(edge.c1)
        rightEdge.limit(edge.c0)
      }

      graph.getEdges(hit)
        .filter(edge => !edge.visited)
        .forEach(edge => edgeHeap.push(edge))
    })

    const frontierEdges = []
    while (edgeHeap.size > 0) {
      const edge = edgeHeap.pop()
      const cs = edge.getTangentCircles(c0.r)
      for (let i = 0; i < cs.length; i += 1) {
        candidateHeap.push(cs[i], pointDistance(c0, cs[i]))
      }
      edge.visited = true
      visitedEdges.push(edge)
      frontierEdges.push(edge)
    }

    frontierEdges.forEach(edge => {
      const adjacent = graph.adjacentEdges(edge).filter(ed => !ed.visited)
      adjacent.forEach(adj => edgeHeap.push(adj))
    })
  }

  // Clean up for the next race before annoucing winner.
  visitedEdges.forEach(edge => {
    edge.visited = false
  })

  return winner
}

const insert = (grid, graph, c0) => {
  // Place the circle at a free position.
  //

  // Find a nearby free tangent circle position.
  const c = findFreePosition(grid, graph, c0)
  // Preserve meta properties.
  const cfix = Object.assign({}, c0, c)
  // Track insertion order. This also gives each fixed circle an identifier.
  cfix.i = grid.size
  // Fix in place: add to grid for fast collision check.
  grid.add(cfix)
  // Finished.
  return cfix
}

const pack = (circles, update) => {
  // Arrange the circles so that they do not overlap.
  //
  // Parameters:
  //   circles
  //     an array of circle2
  //   update
  //     optional function to be called every 10 insertions.
  //
  // Return:
  //   an array of circle2
  //

  // Special case
  if (circles.length < 2) {
    return circles
  }

  // Sort largest first. O(log(n))
  // We will insert the largest first.
  const sorted = circles.slice().sort((a, b) => {
    return b.r - a.r
  })

  // Create a grid for the circles.
  // The grid enables fast collision check once the grid size is
  // in accordance with the circle size.
  const maxRadius = sorted[0] ? sorted[0].r : 100
  const grid = new CircleGrid(maxRadius)
  // Create a graph for the circles.
  // The graph enables fast travel along adjacent circles.
  const graph = new CircleGraph()

  if (!update) {
    return sorted.map(c => insert(grid, graph, c))
  }

  let batch = 0
  const speed = 10 // circles per second
  const delay = 1000 / speed
  const tick = () => {
    if (batch < sorted.length) {
      const c = sorted[batch]
      const free = insert(grid, graph, c)
      update(free)
      batch += 1
      setTimeout(tick, delay)
    }
  }
  tick()
}

// Extend if globally available.
affineplane.sphere2.pack = pack
affineplane.circle2.pack = pack

// Ensure in-browser availability.
if (window) {
  window.affineplane = affineplane
}

// CommonJS export
if (module && module.exports) {
  module.exports = pack
}
