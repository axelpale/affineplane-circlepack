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
  // Create any missing edges between these circles.
  //
  // Parameters:
  //   cs
  //     an array of circle2
  //
  const edges = this.edges
  const n = cs.length

  // For each pair of circles...
  for (let x = 0; x < n; x += 1) {
    const c0 = cs[x]
    for (let y = x + 1; y < n; y += 1) {
      const c1 = cs[y]
      const i = c0.i
      const j = c1.i
      if (!edges[i] || !edges[i][j]) {
        // Edge does not exist. Create an edge.
        this.addEdge(c0, c1)
      }
    }
  }
}

CircleGraph.prototype.adjacentEdges = function (edge) {
  // Get edges adjacent to the given edge.
  //
  // Parameter:
  //   edge
  //     an Edge
  //
  // Return:
  //   an array of Edge
  //

  // Nodes
  const c0 = edge.c0
  const c1 = edge.c1
  // Edges of nodes.
  const edges0 = Object.values(this.edges[c0.i])
  const edges1 = Object.values(this.edges[c1.i])
  // Join the edges.
  const edges = edges0.concat(edges1)
  // Remove the seed edge (exists twice)
  return edges.filter(e => e !== edge)
}

CircleGraph.prototype.edgeNeighborhood = function (cs) {
  // Get all edges that are incident to at least one circle of cs.
  //
  // Parameters:
  //   cs
  //     an array of circle2
  //
  // Return:
  //   an array of Edge
  //
  const result = new Set()
  const n = cs.length

  let i, j, cid, edges
  for (i = 0; i < n; i += 1) {
    cid = cs[i].i
    edges = Object.values(this.edges[cid])
    for (j = 0; j < edges.length; j += 1) {
      result.add(edges[j])
    }
  }

  return Array.from(result)
}

CircleGraph.prototype.getEdges = function (c) {
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
