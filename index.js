const affineplane = require('affineplane')
const CircleGrid = require('./grid')
const CircleGraph = require('./graph')
const BinaryHeap = require('./heap')
const nearestTangent = require('./circle/nearestTangent')

const dist2 = (p, q) => {
  const dx = q.x - p.x
  const dy = q.y - p.y
  return dx * dx + dy * dy
}

const findFreePosition = (grid, graph, c0) => {
  // Find a good tight position for the circle c0
  // as close to the original location as possible.

  // Rank tangent circle candidates by distance.
  const candidateHeap = new BinaryHeap()
  const edgeHeap = new BinaryHeap()

  // Track which edges to clean up afterwards.
  const visitedEdges = []

  let winner = null

  candidateHeap.push(c0, 0)
  while (candidateHeap.size > 0) {
    // Draw next candidate.
    const candidate = candidateHeap.pop()
    // Find colliding circles. Use slightly smaller circle
    // so that a good candidate does not hit its parents.
    const shaven = { x: candidate.x, y: candidate.y, r: candidate.r * 0.999 }
    const overlap = grid.overlap(shaven)
    // No obstacles.
    if (overlap.length === 0) {
      winner = candidate // WINNER!
      break
    }
    // Just one obstacle.
    if (overlap.length === 1) {
      const c = overlap[0]
      // Ensure an edge exist between the overlap and possible parents.
      if (candidate.parent) {
        graph.addEdge(c, candidate.parent)
      }
      if (candidate.parentEdge) {
        const edge = candidate.parentEdge
        graph.addEdge(c, edge.c0)
        graph.addEdge(c, edge.c1)
      }
      // Compute distance to each non-visited edge
      // and place them to tangent generation.
      const edges = graph.incidentEdges(c)
      if (edges.length > 0) {
        // Edges available for tangent generation and traversal.
        for (let i = 0; i < edges.length; i++) {
          const edge = edges[i]
          if (!edge.visited) {
            edgeHeap.push(edge, dist2(c0, edge.middle))
            edge.visited = true
            visitedEdges.push(edge)
          }
        }
      } else {
        // No edges available. Try the default position.
        const nextCandidate = nearestTangent(candidate, c)
        // Store the candidate parent so that we can connect it directly
        // in case it becomes selected.
        nextCandidate.parent = c
        // Next round
        candidateHeap.push(nextCandidate, dist2(c0, nextCandidate))
      }
    } else {
      // The candidate overlaps two or more circles.
      // Ensure these circles are connected.

      // If candidate has known parents, they do not overlap with the candidate.
      // Therefore they are not included in the overlap array.
      // In order to ensure that edges exist between the parents and
      // the overlapping nodes, add them to the seet for which to create edges.
      if (candidate.parent) {
        overlap.push(candidate.parent)
      }
      if (candidate.parentEdge) {
        const edge = candidate.parentEdge
        overlap.push(edge.c0)
        overlap.push(edge.c1)
      }
      // Create all missing edges between these already-inserted circles.
      const edges = graph.addEdges(overlap)

      // Add non-visited edges for further processing.
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i]
        if (!edge.visited) {
          // Harden each edge with respect to the overlap.
          // Some circle subsets in the overlap might be linearly dependent.
          for (let j = 0; j < overlap.length; j++) {
            edge.harden(overlap[j])
          }
          // Send the edge to tangent circle generation.
          edgeHeap.push(edge, dist2(c0, edge.middle))
          edge.visited = true
          visitedEdges.push(edge)
        }
      }
    }

    // Travel and visit the edges until some circle candidates are found.
    while (candidateHeap.size === 0 && edgeHeap.size > 0) {
      const edge = edgeHeap.pop()
      // Compute possible tangent positions if any for this circle radius.
      const cs = edge.getTangentCircles(c0.r)
      for (let i = 0; i < cs.length; i += 1) {
        const tangent = cs[i]
        tangent.parentEdge = edge
        candidateHeap.push(tangent, dist2(c0, tangent))
      }
      // Expand to adjacent edges that might not be reachable via collisions.
      const adjacent = graph.adjacentEdges(edge)
      for (let i = 0; i < adjacent.length; i += 1) {
        const adj = adjacent[i]
        edgeHeap.push(adj, dist2(c0, adj.middle))
        adj.visited = true
        visitedEdges.push(adj)
      }
    }
  }

  // Clean up for the next race before annoucing winner.
  for (let i = 0; i < visitedEdges.length; i++) {
    visitedEdges[i].visited = false
  }

  return winner
}

const insert = (grid, graph, c0) => {
  // Place the circle at a free position.
  //

  // Find a nearby free tangent circle position.
  const c = findFreePosition(grid, graph, c0)
  // DEBUG
  if (!c) {
    console.warn(`No free position found for ${grid.size}th circle:`, c0)
    return null
  }
  // Preserve meta properties.
  const cfix = Object.assign({}, c0, c)
  // Track insertion order. This also gives each fixed circle an identifier.
  cfix.i = grid.size
  // Fix in place: add to grid for fast collision check.
  grid.add(cfix)

  // The circle is now fixed.
  // Create edges to parents if any.
  // We must do this outside findFreePosition because cfix !== c
  // and because c.i is not yet defined.
  if (c.parent) {
    graph.addEdge(c.parent, cfix)
  }
  if (c.parentEdge) {
    const parentEdge = c.parentEdge
    graph.addEdge(parentEdge.c0, cfix)
    graph.addEdge(parentEdge.c1, cfix)
    // Immediately harden the edge limits.
    parentEdge.harden(c)
  }

  // Finished.
  return cfix
}

const pack = (circles, update, final) => {
  // Arrange the circles so that they do not overlap.
  // If `update` and `final` callback functions are given
  // then run in asynchronic manner. Otherwise synchronic.
  //
  // Parameters:
  //   circles
  //     an array of circle2
  //   update
  //     optional function (c). Will be called for every inserted circle c.
  //     If this function is specified, the algorithm will run in asynchronic manner.
  //     The function may return boolean true to stop
  //     .. execution and call the final callback immediately.
  //   final
  //     optional function (). Will be called after all circles are inserted
  //     .. or if execution is interrupted.
  //
  // Return:
  //   an array of circle2 for synchronic execution.
  //   .. Will be undefined for asynchronic execution i.e.
  //   .. if `update` and `final` callback are specified.
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

  // Synchronic run.
  if (!update) {
    const packed = []
    for (let i = 0; i < sorted.length; i++) {
      packed.push(insert(grid, graph, sorted[i]))
    }
    return packed
  }

  // Asynchronic run.
  const insertedCircles = []
  const speed = 100 // circles per second
  const delay = 1000 / speed
  let batchCounter = 0
  const tick = () => {
    if (batchCounter < sorted.length) {
      const c = sorted[batchCounter]
      const freeCircle = insert(grid, graph, c)

      // DEBUG if no free position found, stop immediately
      if (!freeCircle) {
        const bad = Object.assign({}, c, { i: '?', color: { l: 100, a: 0, b: 0 } })
        update(bad)
        final(insertedCircles, graph.getEdges())
        return
      }

      insertedCircles.push(freeCircle)
      const stop = update(freeCircle)
      batchCounter += 1
      if (stop) {
        if (final) {
          final(insertedCircles, graph.getEdges())
        }
      } else {
        // Continue the run.
        setTimeout(tick, delay)
      }
    } else {
      // Finished
      if (final) {
        final(insertedCircles, graph.getEdges())
      }
    }
  }
  tick()
}

// Extend if globally available.
affineplane.sphere2.pack = pack
affineplane.circle2.pack = pack

// Ensure in-browser availability.
if (typeof window !== 'undefined') {
  window.affineplane = affineplane
}

// CommonJS export
if (module && module.exports) {
  module.exports = pack
}
