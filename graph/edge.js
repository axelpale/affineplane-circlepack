const affineplane = require('affineplane')
const innerRadius = require('../circle/innerRadius')
const apollonius = require('apollonius')
const tangentCircle = affineplane.circle2.tangentCircle
const tangentCircles = affineplane.circle2.tangentCircles
const pointDistance = affineplane.point2.distance
const epsilon = affineplane.epsilon

const Edge = function (c0, c1) {
  // DEBUG
  if (!c0) {
    throw new Error('Invalid circle c0: ' + c0)
  }
  if (!c1) {
    throw new Error('Invalid circle c1: ' + c1)
  }

  // Label the edges to ease up debugging.
  this.label = c0.i + '->' + c1.i

  // Direction is arbitrary. Gotta name them somehow.
  this.c0 = c0
  this.c1 = c1

  // Geometry
  this.dx = c1.x - c0.x
  this.dy = c1.y - c0.y
  this.d = Math.sqrt(this.dx * this.dx + this.dy * this.dy)
  this.gap = this.d - c1.r + c0.r
  // TODO OPTIMIZE if c0 and c1 are tangent, use sum of radii

  // Middle point
  this.middle = {
    x: (c0.x + c1.x) / 2,
    y: (c0.y + c1.y) / 2
  }

  // Tangent properties
  this.touching = (Math.abs(this.gap) < epsilon)
  // Given that circles are inserted largest first,
  // we cannot find larger than the smallest of the two circles.
  this.maxLeftRadius = Math.min(c0.r, c1.r)
  this.maxRightRadius = Math.min(c0.r, c1.r)

  // Track which edges are visited by the algorithm.
  // This will be reset after each successful circle insertion.
  this.visited = false
}

Edge.prototype.getTangentCircles = function (r) {
  // Get available tangent circles of radius r if any.
  //
  // Return:
  //   an array of circle2. May be empty.
  //
  if (this.maxLeftRadius < r) {
    // Left hand is not available.
    // How about the right hand?
    if (this.maxRightRadius < r) {
      // No free tangent positions for a circle with radius r.
      return []
    }
    // Right hand is available.
    const cr = tangentCircle(this.c0, this.c1, r, true)
    return [cr]
  }
  // Left hand is available.
  // How about the right hand?
  if (this.maxRightRadius < r) {
    // Right hand is not available. Return only the left hand.
    const cl = tangentCircle(this.c0, this.c1, r, false)
    return [cl]
  }
  // Both hands available.
  // Return both hands with single call.
  return tangentCircles(this.c0, this.c1, r)
}

Edge.prototype.harden = function (c2) {
  // Harden the limits on possible tangent circle radii
  // by discovery of c2 nearby c0 and c1.
  // Requirement: circles are discovered largest first.
  //
  const c0 = this.c0
  const c1 = this.c1

  if (c0 === c2 || c1 === c2) {
    // Nothing to harden
    return
  }

  // Find if c2 is at the left-hand or right-hand side.
  // Use cross product to decide.
  const dx = c2.x - c0.x
  const dy = c2.y - c0.y
  const prod = this.dx * dy - this.dy * dx

  if (Math.abs(prod) < epsilon) {
    // The cross product is zero, the circles are linearly dependent.
    // If c2 is in the gap, we cannot place anything between.
    // Edges between c0 and c2, or c1 and c2, are better suited for
    // tangent discovery.
    const d02 = pointDistance(c0, c2)
    const d12 = pointDistance(c1, c2)
    // The c2 is in the gap if the sum of its distances to the two circles
    // is equal than the distance between the two circles, but
    // larger than their radii.
    if (d02 + d12 <= this.d + epsilon) {
      // The c2 is between c0 and c1.
      if (d02 >= c0.r + c2.r && d12 >= c1.r + c2.r) {
        // The c2 is in the gap.
        this.maxLeftRadius = 0
        this.maxRightRadius = 0
      }
    }
    // Else the circle is not valid to be hardened against.
    return
  }

  // Find maximum radius that can fit between c0, c1, c2.
  let maxRadius
  if (c2.parentEdge === this && this.touching) {
    // The three circles are touching.
    // Thus we can use the lightweight Descartes' theorem.
    maxRadius = innerRadius(c0.r, c1.r, c2.r)
  } else {
    // The three circles are not all touching.
    // Find maximum circle that fits them.
    const maxTangent = apollonius.solve(c0, c1, c2)
    if (!maxTangent) {
      console.log('Cannot find apollonius circle')
      console.log(c0, c1, c2)
      // We thus cannot adjust the radii.
      return
    }
    maxRadius = maxTangent.r
  }

  if (prod < 0) {
    // Negative cross-product
    // => c2 on the left hand side.
    // => limit the left-hand side.
    this.maxLeftRadius = Math.min(this.maxLeftRadius, maxRadius)
  } else {
    // Positive cross-product
    // => c2 on the right hand side.
    // => limit the right-hand side.
    this.maxRightRadius = Math.min(this.maxRightRadius, maxRadius)
  }
}

module.exports = Edge
