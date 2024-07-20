const Tile = require('./tile')
const test = require('tape')

test('basic tile divide', (t) => {
  const tile = new Tile(0, 0, 2, 2, 8)

  t.equal(tile.leaf, true, 'should be leaf')
  tile.divide()
  t.equal(tile.leaf, false, 'should not be leaf anymore')

  t.equal(tile.size, 0, 'should be empty')
  t.deepEqual(tile.collect(), [], 'should be empty')

  const t00 = tile.subtiles[0]
  const t10 = tile.subtiles[1]
  const t01 = tile.subtiles[2]
  const t11 = tile.subtiles[3]

  t.equal(t00.x, 0, 't00.x')
  t.equal(t00.y, 0, 't00.y')
  t.equal(t00.w, 1, 't00.w')
  t.equal(t00.h, 1, 't00.h')

  t.equal(t10.x, 1)
  t.equal(t10.y, 0)
  t.equal(t10.w, 1)
  t.equal(t10.h, 1)

  t.equal(t01.x, 0)
  t.equal(t01.y, 1)
  t.equal(t01.w, 1)
  t.equal(t01.h, 1)

  t.equal(t11.x, 1)
  t.equal(t11.y, 1)
  t.equal(t01.w, 1)
  t.equal(t01.h, 1)

  t.end()
})

test('basic tile add and divide', (t) => {
  const tile = new Tile(0, 0, 2, 2, 8)

  const c0 = { x: 1, y: 1, r: 0.8 } // Overlap all subtiles
  const c1 = { x: 0.5, y: 1.5, r: 0.4 } // Fully inside bottom-left subtile
  const c2 = { x: 5, y: 0, r: 1 } // Fully outside, should not be added.
  const c3 = { x: 1, y: 1.5, r: 0.4 } // Between bottom subtiles.
  tile.add(c0)
  tile.add(c1)
  tile.add(c2) // skipped
  tile.add(c3)

  t.equal(tile.size, 3, 'should not be empty')
  t.equal(tile.circles.length, 3, 'should have circles')
  t.equal(tile.subtiles.length, 0, 'should not yet have subtiles')

  tile.divide()

  t.equal(tile.size, 3, 'should have kept the size')
  t.equal(tile.circles.length, 1, 'should have only cover circle left')
  t.equal(tile.circles[0], c0)
  t.equal(tile.subtiles.length, 4, 'should have subtiles now')

  const t00 = tile.subtiles[0]
  const t10 = tile.subtiles[1]
  const t01 = tile.subtiles[2]
  const t11 = tile.subtiles[3]

  t.equal(t00.circles.length, 0, 'no circles')
  t.equal(t10.circles.length, 0, 'no circles')
  t.equal(t01.circles.length, 2, 'should have both children')
  t.equal(t11.circles.length, 1, 'correct length')

  t.equal(t00.circles.length, 0, 'no circles')
  t.equal(t10.circles.length, 0, 'no circles')
  t.equal(t01.circles[0], c1, 'correct circle')
  t.equal(t01.circles[1], c3, 'correct circle')
  t.equal(t11.circles[0], c3, 'correct circle')

  t.end()
})

test('basic tile overlap', (t) => {
  // Populate a tile
  const tile = new Tile(0, 0, 2, 2, 8)
  const cs = [
    { x: 1, y: 1, r: 0.9 }, // Overlap all subtiles, large.
    { x: 0.5, y: 0.5, r: 0.45 }, // Fully inside top-left subtile
    { x: 1.5, y: 0.5, r: 0.45 }, // Fully inside top-right subtile
    { x: 0.5, y: 1.5, r: 0.45 }, // Fully inside bottom-left subtile
    { x: 1.5, y: 1.5, r: 0.45 }, // Fully inside bottom-right subtile
    { x: 1, y: 0.5, r: 0.45 }, // Between top tiles
    { x: 0.5, y: 1, r: 0.45 }, // Between left tiles
    { x: 1.5, y: 1, r: 0.45 }, // Between right tiles
    { x: 1, y: 1.5, r: 0.45 }, // Between bottom tiles
    { x: 0.2, y: 0.2, r: 0.1 }, // At top left corner
    { x: 1.8, y: 0.2, r: 0.1 }, // At top right corner
    { x: 0.2, y: 1.8, r: 0.1 }, // At bottom left corner
    { x: 1.8, y: 1.8, r: 0.1 }, // At bottom right corner
    { x: 1, y: 1, r: 0.1 } // Overlap all subtiles, small.
  ]
  cs.forEach(c => tile.add(c))

  t.equal(tile.leaf, false, 'should have created subtiles')
  t.equal(tile.size, cs.length, 'should have matching size')
  t.equal(tile.circles.length, 2, 'should have cleared circles except coverers')
  t.equal(tile.subtiles.length, 4, 'should have created subtiles')
  t.equal(tile.depth(), 1, 'should have one layer of subtiles')

  const lap0 = tile.overlap({ x: 1, y: 1, r: 0.5 })
  t.equal(lap0.length, 10, 'should skip the corners')

  const lap1 = tile.overlap({ x: 1.5, y: 0.5, r: 0.45 })
  t.equal(lap1.length, 5, 'should include one corner')

  t.end()
})

test('basic tile collide', (t) => {
  // Populate a tile
  const tile = new Tile(-10, -10, 10, 10, 8)
  const cs = [
    { x: 0, y: 0, r: 9 }, // Overlap all subtiles, large.
    { x: -9, y: -7, r: 0.5 }, // Top left corner
    { x: -9, y: -8, r: 0.5 },
    { x: -9, y: -9, r: 0.5 },
    { x: -8, y: -8, r: 0.5 },
    { x: -8, y: -9, r: 0.5 },
    { x: -7, y: -9, r: 0.5 },
    { x: -9, y: -7, r: 1 }, // Same top left corner, larger radius
    { x: -9, y: -8, r: 1 },
    { x: -9, y: -9, r: 1 },
    { x: -8, y: -8, r: 1 },
    { x: -8, y: -9, r: 1 },
    { x: -7, y: -9, r: 1 }
  ]
  cs.forEach(c => tile.add(c))

  t.equal(tile.collide({ x: 0, y: 0, r: 0 }), true, 'should collide at the middle')
  t.equal(tile.collide({ x: 9, y: 9, r: 1 }), false, 'should not collide at b-right')

  const collection = tile.collect()
  t.equal(collection.length, cs.length, 'should collect all circles')

  t.end()
})

test('add full room of identical circles', (t) => {
  const tile = new Tile(0, 0, 2, 2, 8)

  // Create circles with identical coordinates.
  for (let i = 0; i < 20; i += 1) {
    const c = { x: 1, y: 1, r: 1 }
    tile.add(c)
  }

  t.equal(tile.circles.length, 20, 'should have kept all the circles')
  t.equal(tile.subtiles.length, 4, 'should have subtiles')
  t.equal(tile.subtiles[0].size, 0, 'subtiles should not have circles')
  t.equal(tile.subtiles[1].size, 0, 'subtiles should not have circles')
  t.equal(tile.subtiles[2].size, 0, 'subtiles should not have circles')
  t.equal(tile.subtiles[3].size, 0, 'subtiles should not have circles')

  t.end()
})
