const affineplane = require('affineplane')
const epsilon = affineplane.epsilon

module.exports = (r0, r1, r2) => {
  // Compute the maximum radius of a circle that
  // can be fitted inside the three tangent circles of radii r0,r1,r2.
  //
  // Parameters:
  //   r0
  //     a positive number, a radius
  //   r1
  //     a positive number, a radius
  //   r2
  //     a positive number, a radius
  //
  // Return:
  //   a positive number, the maximum radius of the fourth circle.
  //

  // Use Descarte's theorem.
  const prod = r0 * r1 * r2
  const sum = r0 + r1 + r2
  const pairsum = r0 * r1 + r1 * r2 + r2 * r0

  // If any of the radii are zero, return zero.
  if (Math.abs(prod) < epsilon) {
    return 0
  }

  return prod / (pairsum + 2 * Math.sqrt(prod * sum))
}
