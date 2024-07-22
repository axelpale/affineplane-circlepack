const affineplane = require('affineplane')
const CircleGrid = require('./grid')

const insert = (field, grid, c0) => {
  // Place a circle at a free position on the field.
  //

  // Find a nearby free tangent circle position.
  const c = c0

  // Find colliding circles.

  // Get all edges between the colliders.
  // This is the edge frontier.

  // Find edges with possible free tangent positions -> looseEdges
  // Do this step without collision detection.
  // Collect occupied edges -> hardEdges

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

  // Preserve meta properties.
  const cfix = Object.assign({}, c0, c)
  // Track insertion order. This also gives each fixed circle an identifier.
  cfix.i = field.length
  // Fix in place.
  field.push(cfix)
  // Add to grid for fast collision check
  grid.add(cfix)
  // Finished.
  return cfix
}

const pack = (circles) => {
  // The circles that are already inserted.
  const field = []
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
  // The grid enables fact collision check once the grid size is
  // in accordance with the circle size.
  const maxRadius = sorted[0] ? sorted[0].r : 100
  const grid = new CircleGrid(maxRadius)

  return sorted.map(c => insert(field, grid, c))
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
