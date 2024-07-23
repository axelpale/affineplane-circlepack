const affineplane = require('affineplane')
const difference = affineplane.point2.difference
const scale = affineplane.vec2.scaleBy
const vzero = affineplane.vec2.ZERO
const epsilon = affineplane.epsilon

module.exports = (c0, c1, c2) => {
  // Compute an upper limit estimate for the maximum radius of a circle that
  // can be fitted inside the three freely positioned circles c0,c1,c2.
  //
  // Parameters:
  //   c0
  //     a circle2
  //   c1
  //     a circle2
  //   c2
  //     a circle2
  //
  // Return:
  //   a positive number, an upper limit estimate of the maximum radius of the fourth circle.
  //

  // Vectors
  const v01 = difference(c0, c1)
  const v12 = difference(c1, c2)
  const v20 = difference(c2, c0)
  // Distances
  const d01 = Math.sqrt(v01.x * v01.x + v01.y * v01.y)
  const d12 = Math.sqrt(v12.x * v12.x + v12.y * v12.y)
  const d20 = Math.sqrt(v20.x * v20.x + v20.y * v20.y)

  // Radius vectors from circle centers to their circumference.
  const r01 = d01 < epsilon ? vzero : scale(v01, c0.r / d01)
  const r02 = d20 < epsilon ? vzero : scale(v20, -c0.r / d20)
  const r10 = d01 < epsilon ? vzero : scale(v01, -c1.r / d01)
  const r12 = d12 < epsilon ? vzero : scale(v12, c1.r / d12)
  const r20 = d20 < epsilon ? vzero : scale(v20, c2.r / d20)
  const r21 = d12 < epsilon ? vzero : scale(v12, -c2.r / d12)
  // Mean vectors, roughly towards mass center.
  const m0 = { x: (r01.x + r02.x) / 2, y: (r01.y + r02.y) / 2 }
  const m1 = { x: (r10.x + r12.x) / 2, y: (r10.y + r12.y) / 2 }
  const m2 = { x: (r20.x + r21.x) / 2, y: (r20.y + r21.y) / 2 }

  // Triangle side vectors
  const t01 = {
    x: -m0.x + v01.x + m1.x,
    y: -m0.y + v01.y + m1.y
  }
  const t12 = {
    x: -m1.x + v12.x + m2.x,
    y: -m1.y + v12.y + m2.y
  }
  const t20 = {
    x: -t01.x - t12.x,
    y: -t01.y - t12.y
  }
  // Triangle side lengths
  const s01 = Math.sqrt(t01.x * t01.x + t01.y * t01.y)
  const s12 = Math.sqrt(t12.x * t12.x + t12.y * t12.y)
  const s20 = Math.sqrt(t20.x * t20.x + t20.y * t20.y)

  // Triangle area, Heron's formula
  const p = (s01 + s12 + s20) / 2
  const area = Math.sqrt(p * (p - s01) * (p - s12) * (p - s20))
  // The radius of the circle outside the triangle.
  // If the area is zero, consider a triangle where one side is zero.
  const radius = area < epsilon ? p / 2 : s01 * s12 * s20 / (4 * area)

  // This radius provides an upper limit.
  return radius
}
