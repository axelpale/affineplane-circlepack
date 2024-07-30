const affineplane = require('affineplane')
const CircleGrid = require('./grid')
const CircleGraph = require('./graph')
const BinaryHeap = require('./heap')
const nearestTangent = require('./circle')

const findFreePosition = (grid, graph, c0) => {
  // Find a good tight position for the circle c0
  // as close to the original location as possible.

  // Rank tangent circle candidates by distance.
  const candidateHeap = new BinaryHeap()
  candidateHeap.push(c0, 0)

  while (candidateHeap.size > 0) {
    // Draw next candidate.
    const candidate = candidateHeap.pop()
    // Find colliding circles.
    const overlap = grid.overlap(candidate)
    // No obstacles.
    if (overlap.length === 0) {
      return candidate
    }
    // Just one obstacle. Cannot yet create edge.
    if (overlap.length === 1) {
      const near = nearestTangent(c0, overlap[0])
      // Candidate must be a bit larger to ensure hit to overlap.
      near.r *= 1.0001
      // Distance of zero for immediate pop.
      candidateHeap.push(near, 0)
      continue
    }
    // Else the candidate overlaps two or more circles.
    // Ensure these are connected.
    const edges = graph.clique(overlap)
    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i]
      const tangents = edge.getTangentCircles()
      for (let t = 0; t < tangents.length; t += 1) {
        const tangent = tangents[t]
        const dx = tangent.x - c0.x
        const dy = tangent.y - c0.y
        const d2 = dx * dx + dy * dy
        candidateHeap.push(candidate, d2)
      }
    }
  }

  // No candidates left
  return null

  // Find edges with possible free tangent positions -> looseEdges
  // Do this step without collision detection.
  // const looseEdges = edges.filter(edge.hasRoomFor(c))
  // Collect occupied edges -> hardEdges
  // const hardEdges = edges.filter(!edge.hasRoomFor(c))

  // For each loose edge, generate remaining tangent circle candidates.
  // For each candidate, do a field collision check.
  // Collect free candidates and colliding candidates.
  // If one or more free candidates, pick the closest candidate.
  // Else, for each loose edge for each collision, create edges between colliders.
  //   Compute left-hand and right-hand limits for each edge.
  //   Update the limits of the original loose edge and add to hardEdges.
  //   Add each new edge to the set of hardEdges.

  // If no free candidate found,
  // for each hard edge, expand and form the next frontier until one is found.

  // Once a free candidate is found:
  // - mark all edges and nodes unvisited for the next search.
  // - create edges between the new candidate and its tangent parents.
  // - update limits of the edge between parents.
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

const pack = (circles) => {
  // Arrange the circles so that they do not overlap.
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

  return sorted.map(c => insert(grid, graph, c))
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
