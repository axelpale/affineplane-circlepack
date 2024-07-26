const affineplane = require('affineplane')
const innerRadius = require('../circle/innerRadius')
const apollonius = require('../circle/apollonius')
const tangentCircle = affineplane.circle2.tangentCircle
const tangentCircles = affineplane.circle2.tangentCircles

const Edge = function (c0, c1) {
  // Direction is arbitrary. Gotta name them somehow.
  this.c0 = c0
  this.c1 = c1

  // Geometry
  this.dx = c1.x - c0.x
  this.dy = c1.y - c0.y
  this.d = Math.sqrt(this.dx * this.dx + this.dy * this.dy)
  this.gap = this.d - c1.r + c0.r
  // TODO OPTIMIZE if c0 and c1 are tangent, use sum of radii

  // Tangent properties
  this.touching = (Math.abs(this.gap) < affineplane.epsilon)
  this.maxLeftRadius = null // unknown
  this.maxRightRadius = null // unknown
}

Edge.prototype.center = () => {
  // Get edge center point.
  const x = (this.c0.x + this.c1.x) / 2
  const y = (this.c0.y + this.c1.y) / 2
  return { x, y }
}

Edge.prototype.getTangentCircles = (r) => {
  // Get available tangent circles of radius r if any.
  //
  // Return:
  //   an array of circle2. May be empty.
  //
  if (this.maxLeftRadius < r) {
    if (this.maxRightRadius < r) {
      // No free tangent positions for a circle with radius r.
      return []
    }
    // Right-hand is available.
    const cr = tangentCircle(this.c0, this.c1, r, true)
    return [cr]
  }
  // Left-hand is available.

  if (this.maxRightRadius < r) {
    // Right-hand is not available. Return only left-hand.
    const cl = tangentCircle(this.c0, this.c1, r, false)
    return [cl]
  }
  // Both hands available.

  return tangentCircles(this.c0, this.c1, r)
}

Edge.prototype.hardenGap = (c2) => {
  // Harden the limits of available tangent circles
  // by discovery of c2 nearby c0 and c1.
  // The stricter limits are computed by fast approximation.
  // The approximation may overestimate but not underestimate
  // the largest available radii.
  // Requirement: circles are discovered largest first.
  //

  // Find if c2 is at the left-hand or right-hand side.
  // Use cross product.
  const dx = c2.x - this.c0.x
  const dy = c2.y - this.c0.y
  const prod = this.dx * dy - this.dy * dx

  if (prod > 0) {
    // Left-hand side
    const maxRadius = apollonius(this.c0, this.c1, c2).r
    this.maxLeftRadius = Math.min(this.maxLeftRadius, maxRadius)
  } else if (prod < 0) {
    // Right-hand side
    const maxRadius = apollonius(this.c0, this.c1, c2).r
    this.maxRightRadius = Math.min(this.maxRightRadius, maxRadius)
  } else {
    // The cross product is zero. At the line. Weird.
    console.warn('Weird tangent position.')
  }
}

Edge.prototype.hardenTangent = (c2) => {
  // Harden the limits of available tangent circles
  // by discovery of c2 that is assumed to be
  // tangent to c0 and c1.
  //

  // Find if c2 is at the left-hand or right-hand side.
  // Use cross product.
  const dx = c2.x - this.c0.x
  const dy = c2.y - this.c0.y
  const prod = this.dx * dy - this.dy * dx

  const maxRadius = innerRadius(this.c0.r, this.c1.r, c2.r)

  if (prod > 0) {
    // Left-hand side
    this.maxLeftRadius = Math.min(this.maxLeftRadius, maxRadius)
  } else if (prod < 0) {
    // Right-hand side
    this.maxRightRadius = Math.min(this.maxRightRadius, maxRadius)
  } else {
    // The cross product is zero. At the line. Weird.
    console.warn('Weird tangent position.')
  }
}

module.exports = Edge
