const pack = (circles) => {
  return circles
}

// Extend
if (affineplane && affineplane.sphere2) {
  affineplane.sphere2.pack = pack
}
// Export
if (module && module.exports) {
  module.exports = pack
}
