const Heap = function () {
  // Minimal binary min-heap for objects.
  // Just push() and pop().

  const heap = []
  const weights = []
  this.size = 0

  this.push = (c, weight) => {
    // Push new element with a weight.
    //
    // Parameters:
    //   c
    //     a value
    //   weight
    //     a number
    //
    if (!c || typeof weight !== 'number') {
      return
    }
    // Heap insertion position.
    let i = heap.length
    heap.push(c)
    weights.push(weight)
    this.size += 1

    // Preserve the heap property: bring smallest at the top.
    // Swap until parent is smaller or root.
    let parent = (i - 1) >> 1 // same as Math.floor((i - 1) / 2)
    let swap
    while (parent >= 0 && weights[parent] > weight) {
      // Swap objects
      swap = heap[parent]
      heap[parent] = heap[i]
      heap[i] = swap
      // Swap weights
      swap = weights[parent]
      weights[parent] = weights[i]
      weights[i] = swap
      // Next
      i = parent
      parent = (i - 1) >> 1 // same as Math.floor((i - 1) / 2)
    }
  }

  this.pop = () => {
    // Pop the smallest at the top.
    //
    // Return
    //   an object or null if the heap is empty.
    //
    if (heap.length === 0) {
      return null
    }
    const top = heap[0]

    // Swap the last to the top.
    let i = heap.length - 1
    heap[0] = heap[i]
    weights[0] = weights[i]
    heap.pop()
    weights.pop()
    this.size -= 1

    // Preserve the heap property: move the top down until both children are larger.
    const len = heap.length
    i = 0
    let j = 0
    let left, right, w, swap
    while (i < len) {
      left = 2 * i + 1
      right = 2 * i + 2
      w = weights[i]
      if (right < len) {
        // Both left and right child exist.
        if (weights[left] < w) {
          // Left is smaller.
          if (weights[right] < w) {
            // Both smaller. Pick the smallest.
            if (weights[right] < weights[left]) {
              j = right
            } else {
              j = left
            }
          } else {
            // Right is too large. Pick the left.
            j = left
          }
        } else {
          // Left is too large.
          if (weights[right] < w) {
            // Right is smaller. Pick the right.
            j = right
          } else {
            // Else both too large. The heap property is fulfilled.
            break
          }
        }
      } else if (left < len) {
        // Only left child exists.
        if (weights[left] < w) {
          // The left child is smaller.
          j = left
        } else {
          // Else the heap property is fulfilled.
          break
        }
      } else {
        // Else we are at the last heap element and the heap property is fulfilled.
        break
      }

      // Swap objects
      swap = heap[j]
      heap[j] = heap[i]
      heap[i] = swap
      // Swap weights
      swap = weights[j]
      weights[j] = weights[i]
      weights[i] = swap
      // Next
      i = j
    }

    return top
  }

  return this
}

module.exports = Heap
