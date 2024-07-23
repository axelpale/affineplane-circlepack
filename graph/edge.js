const affineplane = require('affineplane')

const Edge = function (c0, c1) {
  // Direction is arbitrary. Gotta name them somehow.
  this.source = c0
  this.target = c1

  // Geometry
  const dx = c1.x - c0.x
  const dy = c1.y - c0.y
  this.d = Math.sqrt(dx * dx + dy * dy)
  // TODO OPTIMIZE if c0 and c1 are tangent, use sum of radii

  // Tangent properties
  this.maxLeftRadius = null // unknown
  this.maxRightRadius = null // unknown
}

Edge.prototype.center = () => {
  const x = (this.source.x + this.target.x) / 2
  const y = (this.source.y + this.target.y) / 2
  return { x, y }
}

Edge.prototype.getTangentCircles = (r) => {
  return affineplane.circle2.tangentCircles(this.source, this.target, r)
}

Edge.prototype.hardenGap = (c2) => {
  // Harden the limits of possible tangent circle radii
  // by fast approximation. The approximation
  // may overestimate but not underestimate the
  // largest available radii.
  //

  // Quickly estimate largest radius.
  // const leftRadius
  // const rightRadius,
}

Edge.prototype.hardenTangent = (c2) => {
  // Harden the limits of available tangent circles
  // by assuming c2 to be a tangent to c0 and c1.
  //
}

module.exports = Edge
