// CircleGraph
//
// Graph structure for traversing in a network of circles
// and for finding free tangent circle positions.

// Methods:
// graph.addEdge
//   Create an edge and compute tangent circle conditions
//   for fast pass or test.
// graph.clique
//   ensure edges between the set of nodes.
// graph.edgesBetween
//   return all existing edges between an array of nodes.
const Edge = require('./edge')

const CircleGraph = function () {
  // A map of maps: cid -> cid -> edge
  this.edges = {}
}

CircleGraph.prototype.addEdge = function (c0, c1) {
  // Ensure the edge exists between two circles.
  // If edge does not exist, create and add.
  //
  // Parameters:
  //   c0
  //     a circle2 with .i property
  //   c1
  //     a circle2 with .i property
  //
  // Returns:
  //   an Edge
  //

  // Shorthand
  const edges = this.edges
  const i = c0.i
  const j = c1.i
  // We may or may not create an edge.
  let edge

  // Route from c0 to c1
  if (edges[i]) {
    if (edges[i][j]) {
      edge = edges[i][j]
    } else {
      edge = new Edge(c0, c1)
      edges[i][j] = edge
    }
  } else {
    edges[i] = {}
    edges[i][j] = new Edge(c0, c1)
  }

  // DEBUG
  if (!edge) { throw new Error('Failed to create an edge.') }

  // Route from c1 to c0
  if (edges[j]) {
    if (!edges[j][i]) {
      edge[j][i] = edge
    }
  } else {
    edges[j] = {}
    edges[j][i] = edge
  }

  return edge
}

CircleGraph.prototype.getEdges = function (c) {
  // Get edges adjacent to the circle.
  //
  // Parameters:
  //   c
  //     a circle2 with .i property
  //
  // Return:
  //   an array of Edge
  //
  const targets = this.edges[c.i]
  if (targets) {
    return Object.values(targets)
  }
  return []
}

CircleGraph.prototype.clique = function (cs) {
  // Get edges between these circles.
  // Create the edges if needed.
  // REQUIREMENT: The circles must be inserted largest first.
  //
  // Parameters:
  //   cs
  //     an array of circle2
  //
  // Return:
  //   an array of Edge
  //
  const edges = this.edges
  const n = cs.length
  const result = []

  // DEBUG
  if (n > 6) {
    console.warn('The clique has too many circles. Ensure decreasing insertion order.')
  }

  for (let x = 0; x < n; x += 1) {
    const c0 = cs[x]
    for (let y = x + 1; y < n; y += 1) {
      const c1 = cs[y]
      const i = c0.i
      const j = c1.i
      if (edges[i] && edges[i][j]) {
        // The edge exists.
        result.push(edges[i][j])
      } else {
        // Create an edge.
        // Except when the gap between the circles is larger than the diameter of the smallest circle.
        // TODO OPTIMIZE skip gaps larger than the actual smallest circle diameter.
        const dx = c1.x - c0.x
        const dy = c1.y - c0.y
        const gap = dx * dx + dy * dy - (c0.r + c1.r)
        if (gap < 2 * c0.r && gap < 2 * c1.r) {
          const edge = this.addEdge(c0, c1)
          result.push(edge)
        }
      }
    }
  }

  return result
}

module.exports = CircleGraph