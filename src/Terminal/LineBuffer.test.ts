import { describe, expect, it } from 'vitest'
import LineBuffer from './LineBuffer'

// Type a whole string through insert(), char by char.
const type = (buffer: LineBuffer, text: string): void => {
  for (const ch of text) {
    buffer.insert(ch)
  }
}

describe('LineBuffer', () => {
  it('insert builds text and advances the cursor', () => {
    const buffer = new LineBuffer()
    const out = buffer.insert('a')
    expect(typeof out).toBe('string')
    type(buffer, 'bc')
    expect(buffer.text).toBe('abc')
    expect(buffer.cursor).toBe(3)
  })

  it('insert places characters at the cursor when mid-line', () => {
    const buffer = new LineBuffer()
    type(buffer, 'ac')
    buffer.left()
    buffer.insert('b')
    expect(buffer.text).toBe('abc')
    expect(buffer.cursor).toBe(2)
  })

  it('backspace removes the char before the cursor', () => {
    const buffer = new LineBuffer()
    type(buffer, 'abc')
    const out = buffer.backspace()
    expect(typeof out).toBe('string')
    expect(buffer.text).toBe('ab')
    expect(buffer.cursor).toBe(2)
  })

  it('backspace deletes mid-line and keeps the tail', () => {
    const buffer = new LineBuffer()
    type(buffer, 'abc')
    buffer.left()
    buffer.backspace()
    expect(buffer.text).toBe('ac')
    expect(buffer.cursor).toBe(1)
  })

  it('backspace is a no-op at position 0', () => {
    const buffer = new LineBuffer()
    type(buffer, 'ab')
    buffer.home()
    const out = buffer.backspace()
    expect(out).toBe('')
    expect(buffer.text).toBe('ab')
    expect(buffer.cursor).toBe(0)
  })

  it('del forward-deletes the char at the cursor', () => {
    const buffer = new LineBuffer()
    type(buffer, 'abc')
    buffer.home()
    buffer.del()
    expect(buffer.text).toBe('bc')
    expect(buffer.cursor).toBe(0)
  })

  it('del is a no-op at end of line', () => {
    const buffer = new LineBuffer()
    type(buffer, 'abc')
    const out = buffer.del()
    expect(out).toBe('')
    expect(buffer.text).toBe('abc')
    expect(buffer.cursor).toBe(3)
  })

  it('left and right move and clamp at bounds', () => {
    const buffer = new LineBuffer()
    type(buffer, 'ab')
    expect(buffer.cursor).toBe(2)
    buffer.left()
    expect(buffer.cursor).toBe(1)
    buffer.left()
    expect(buffer.cursor).toBe(0)
    // Clamped at the start.
    expect(buffer.left()).toBe('')
    expect(buffer.cursor).toBe(0)
    buffer.right()
    buffer.right()
    expect(buffer.cursor).toBe(2)
    // Clamped at the end.
    expect(buffer.right()).toBe('')
    expect(buffer.cursor).toBe(2)
  })

  it('home and end jump to the bounds', () => {
    const buffer = new LineBuffer()
    type(buffer, 'hello')
    buffer.home()
    expect(buffer.cursor).toBe(0)
    buffer.end()
    expect(buffer.cursor).toBe(5)
  })

  it('clearLine empties the line and resets the cursor', () => {
    const buffer = new LineBuffer()
    type(buffer, 'hello')
    const out = buffer.clearLine()
    expect(typeof out).toBe('string')
    expect(buffer.text).toBe('')
    expect(buffer.cursor).toBe(0)
  })

  it('clearLine resets history recall so historyPrev restarts from newest', () => {
    const buffer = new LineBuffer()
    type(buffer, 'first')
    buffer.submit()
    type(buffer, 'second')
    buffer.submit()
    buffer.historyPrev()
    buffer.historyPrev()
    expect(buffer.text).toBe('first')
    // Ctrl-C / Ctrl-L path: clearLine must exit history recall.
    buffer.clearLine()
    buffer.historyPrev()
    expect(buffer.text).toBe('second')
  })

  it('submit returns the line, empties it, and records history', () => {
    const buffer = new LineBuffer()
    type(buffer, 'ls -la')
    const submitted = buffer.submit()
    expect(submitted).toBe('ls -la')
    expect(buffer.text).toBe('')
    expect(buffer.cursor).toBe(0)
    expect(buffer.history).toEqual(['ls -la'])
  })

  it('submit does not record an empty line', () => {
    const buffer = new LineBuffer()
    const submitted = buffer.submit()
    expect(submitted).toBe('')
    expect(buffer.history).toEqual([])
  })

  it('historyPrev recalls the submitted line', () => {
    const buffer = new LineBuffer()
    type(buffer, 'whoami')
    buffer.submit()
    const out = buffer.historyPrev()
    expect(typeof out).toBe('string')
    expect(buffer.text).toBe('whoami')
    expect(buffer.cursor).toBe('whoami'.length)
  })

  it('historyPrev and historyNext walk the stack', () => {
    const buffer = new LineBuffer()
    type(buffer, 'first')
    buffer.submit()
    type(buffer, 'second')
    buffer.submit()

    // Walk backward: newest first, then oldest, then clamp at oldest.
    buffer.historyPrev()
    expect(buffer.text).toBe('second')
    buffer.historyPrev()
    expect(buffer.text).toBe('first')
    buffer.historyPrev()
    expect(buffer.text).toBe('first')

    // Walk forward: back to newest, then to a fresh empty line.
    buffer.historyNext()
    expect(buffer.text).toBe('second')
    buffer.historyNext()
    expect(buffer.text).toBe('')
    expect(buffer.cursor).toBe(0)
  })

  it('historyNext is a no-op while editing a fresh line', () => {
    const buffer = new LineBuffer()
    type(buffer, 'echo hi')
    buffer.submit()
    expect(buffer.historyNext()).toBe('')
    expect(buffer.text).toBe('')
  })
})
