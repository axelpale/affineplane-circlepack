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
  // A kind of incidence matrix.
  // A map of maps: circle id -> circle id -> edge
  this.edges = {}
}

CircleGraph.prototype.addEdge = function (c0, c1) {
  // Ensure the edge exists between two circles.
  // If edge does not exist, create and add.
  // Will prevent self-loop edges if the given circles are equal and
  // will return null if so.
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

  // Circle identifiers
  const i = c0.i
  const j = c1.i
  // Prevent self-loops.
  if (i === j) {
    return
  }

  // Shorthand
  const edges = this.edges
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
    edge = new Edge(c0, c1)
    edges[i] = {}
    edges[i][j] = edge
  }

  // DEBUG
  if (!edge) { throw new Error('Failed to create an edge.') }

  // Route from c1 to c0
  if (edges[j]) {
    if (!edges[j][i]) {
      edges[j][i] = edge
    }
  } else {
    edges[j] = {}
    edges[j][i] = edge
  }

  return edge
}

CircleGraph.prototype.addEdges = function (cs) {
  // Create any missing edges and then
  // return all the edges between these circles.
  //
  // Parameters:
  //   cs
  //     an array of circle2
  //
  const edges = this.edges
  const n = cs.length
  const result = []

  // For each non-symmetrical pair of circles...
  for (let x = 0; x < n; x += 1) {
    const c0 = cs[x]
    for (let y = x + 1; y < n; y += 1) {
      const c1 = cs[y]
      const i = c0.i
      const j = c1.i
      if (i !== j) {
        if (edges[i] && edges[i][j]) {
          // Edge exists.
          result.push(edges[i][j])
        } else {
          // Edge does not exist. Create an edge.
          result.push(this.addEdge(c0, c1))
        }
      }
    }
  }

  return result
}

CircleGraph.prototype.adjacentEdges = function (edge) {
  // Get non-visited edges adjacent to the given edge.
  // The result does not include the given edge.
  //
  // Parameter:
  //   edge
  //     an Edge
  //
  // Return:
  //   an array of Edge
  //
  const result = []

  // Edges
  const edges0 = Object.values(this.edges[edge.c0.i])
  const edges1 = Object.values(this.edges[edge.c1.i])

  let ed
  for (let i = 0; i < edges0.length; i += 1) {
    ed = edges0[i]
    // Skip the given edge (exists twice).
    // Also skip the visited edges.
    if (ed !== edge && !ed.visited) {
      result.push(ed)
    }
  }

  for (let i = 0; i < edges1.length; i += 1) {
    ed = edges1[i]
    // Skip the given edge (exists twice).
    // Also skip the visited edges.
    if (ed !== edge && !ed.visited) {
      result.push(ed)
    }
  }

  return result
}

CircleGraph.prototype.getEdges = function () {
  // Collect all edges of the graph into an array.
  //
  const result = []
  const nodeIds = Object.keys(this.edges)
  const n = nodeIds.length

  // Because all edge pairs are routed symmetrically
  // it is enough to loop through half of the ordered pairs.
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const source = nodeIds[i]
      const targets = this.edges[source]
      if (targets[j]) {
        result.push(targets[j])
      }
    }
  }

  return result
}

CircleGraph.prototype.incidentEdges = function (c) {
  // Get edges incident on the circle.
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

module.exports = CircleGraph
