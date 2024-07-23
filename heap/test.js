const Heap = require('./index')
const test = require('tape')

test('basic heap', (t) => {
  const h = new Heap()
  t.equal(h.pop(), null, 'should be empty')

  h.push()
  h.push('no-weight')
  h.push('bad-weight', 'bad')
  t.equal(h.pop(), null, 'should still be empty')
  t.equal(h.size, 0, 'should still be empty')

  h.push('hello', 5)
  t.equal(h.size, 1, 'should not be empty')
  t.equal(h.pop(), 'hello', 'should have element')

  h.push('hola', 4)
  h.push('hello', 5)
  h.push('hi', 2)
  t.equal(h.size, 3, 'should have elements')
  t.equal(h.pop(), 'hi', 'should have put smallest first')
  t.equal(h.pop(), 'hola', 'should have kept order')
  t.equal(h.pop(), 'hello', 'should have put largest last')
  t.equal(h.pop(), null, 'should clear our')
  t.equal(h.size, 0, 'should have no elements')

  t.end()
})

test('heap with equal weights', (t) => {
  const h = new Heap()

  h.push('ho', 2)
  h.push('yo', 2)
  h.push('hi', 2)
  t.equal(h.pop(), 'ho', 'should respect FIFO')
  t.equal(h.pop(), 'hi', 'should not respect FIFO')
  t.equal(h.pop(), 'yo', 'should not respect FIFO')

  h.push('ho', 2)
  h.push('yo', 2)
  h.push('hi', 2)
  h.push('hello', 5)
  h.push('h', 1)
  t.equal(h.pop(), 'h', 'should deal with equal weights')

  t.end()
})

test('heap with negative weights', (t) => {
  const h = new Heap()

  h.push('a', -4)
  h.push('b', 0)
  h.push('c', 2)
  h.push('d', -9)
  h.push('e', -9)
  h.push('f', -2)
  h.push('g', 100)

  t.equal(h.pop(), 'd', 'should pop FIFO')
  t.equal(h.pop(), 'e', 'should pop most negative first')
  t.equal(h.pop(), 'a')
  t.equal(h.pop(), 'f')
  t.equal(h.pop(), 'b')
  t.equal(h.pop(), 'c')
  t.equal(h.pop(), 'g')
  t.equal(h.pop(), null, 'should be empty')

  t.end()
})
