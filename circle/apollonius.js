const affineplane = require('affineplane')
const epsilon = affineplane.epsilon

module.exports = (c1, c2, c3) => {
  // Find a circle that is externally tangent to the three circles c1,c2,c3.
  // If no such circle exists on the real plane, return null.
  // The result is one of the solutions to the problem of Apollonius.
  //
  // Parameters:
  //   c1
  //     a circle2
  //   c2
  //     a circle2
  //   c3
  //     a circle2
  //
  // Return:
  //   a circle2 or null
  //

  // Circle differences
  const dx12 = c2.x - c1.x
  const dx23 = c3.x - c2.x
  const dx31 = c1.x - c3.x
  const dy12 = c2.y - c1.y
  const dy23 = c3.y - c2.y
  const dy31 = c1.y - c3.y
  // Circle expressions of form x^2 + y^2 - r^2
  const g1 = c1.x * c1.x + c1.y * c1.y - c1.r * c1.r
  const g2 = c2.x * c2.x + c2.y * c2.y - c2.r * c2.r
  const g3 = c3.x * c3.x + c3.y * c3.y - c3.r * c3.r
  // Coefficients for the coordinates x=(a+b*r)/D, y=(c+d*r)/D
  // Determinant (denominator)
  const D = 2 * (c1.y * dx23 + c2.y * dx31 + c3.y * dx12)
  // Special case: determinant is zero.
  if (Math.abs(D) < epsilon) return null
  const a = -(dy23 * g1 + dy31 * g2 + dy12 * g3)
  const b = 2 * (c1.r * dy23 + c2.r * dy31 + c3.r * dy12)
  const c = dx23 * g1 + dx31 * g2 + dx12 * g3
  const d = -2 * (c1.r * dx23 + c2.r * dx31 + c3.r * dx12)
  // We solve r via a quadratic formula r=(-Q±sqrt(Q^2-P*R))/P
  // We use c1 as an anchor.
  const dx = D * c1.x - a
  const dy = D * c1.y - c
  const dr = D * c1.r
  // Coefficients
  const P = b * b + d * d - D * D
  const Q = b * dx + d * dy + D * dr
  const R = dx * dx + dy * dy - dr * dr
  // Special case: quadratic formula denominator is zero.
  if (Math.abs(P) < epsilon) return null
  // Discriminant
  let disc = Q * Q - P * R
  // Special case: discriminant is negative. Deal with floating point issues.
  if (Math.abs(disc) < epsilon) disc = 0
  if (disc < 0) return null
  // Find the target radius
  const r = (Q - Math.sqrt(disc)) / P
  // Find the target circle center
  const x = (a + b * r) / D
  const y = (c + d * r) / D
  // Return the circle
  return { x, y, r }
}
