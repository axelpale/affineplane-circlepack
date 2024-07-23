const affineplane = require('affineplane')
const difference = affineplane.point2.difference
const epsilon = affineplane.epsilon

module.exports = (ca, cb) => {
  // Find a position for circle ca that touches a fixed and possibly colliding circle cb.
  //

  // Use vectors
  const vab = difference(ca, cb)
  const d2 = vab.x * vab.x + vab.y * vab.y
  if (d2 - epsilon < 0 && d2 + epsilon > 0) {
    // Circles are concentric. Diff vector is practically zero, thus we cannot take norm.
    // Find the default tangent at the right.
    return {
      x: cb.x + cb.r + ca.r,
      y: cb.y,
      r: ca.r
    }
  }
  // Circles are not concentric => we can get a vector from cb towards a tangent circle.
  const d = Math.sqrt(d2)
  // Close the gap: move ca 'gap' units towards cb.
  // If circles overlap, the gap is negative: move ca -gap units away from cb.
  const gap = d - ca.r - cb.r
  const vnorm = gap / d // if gap negative, vab gets inverted, ca moved away from cb.
  // Translate ca
  return {
    x: ca.x + vab.x * vnorm,
    y: ca.y + vab.y * vnorm,
    r: ca.r
  }
}
