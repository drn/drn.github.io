// A pure, DOM-free line editor for the xterm.js terminal.
//
// LineBuffer owns the current input line ({ text, cursor }) and a command
// history. Every editing method mutates internal state and returns the ANSI
// escape string needed to repaint the terminal from the current cursor
// position, so mid-line edits render correctly without a full-screen redraw.
//
// Escape sequences used:
//   '\b'        — move cursor left one column (backspace, non-destructive)
//   '\x1b[C'    — Cursor Forward one column (CUF)
//   '\x1b[D'    — Cursor Back one column (CUB)
//   '\x1b[<n>D' — Cursor Back n columns
//   '\x1b[K'    — Erase in Line, from cursor to end of line (EL0)

const CUF = '\x1b[C'
const CUB = '\x1b[D'
const ERASE_TO_EOL = '\x1b[K'

// Cursor Back n columns; empty string when n is 0 so we never emit '\x1b[0D'.
const cursorBack = (n: number): string => (n > 0 ? `\x1b[${n}D` : '')

class LineBuffer {
  text = ''
  cursor = 0
  history: string[] = []

  // Index into history while recalling; -1 means "editing a fresh line".
  private historyIndex = -1

  // Insert a character at the cursor and advance. When at end of line we just
  // echo the char; mid-line we echo the char plus the trailing remainder, then
  // walk the cursor back over that remainder so it sits right after the insert.
  insert(ch: string): string {
    const tail = this.text.slice(this.cursor)
    this.text = this.text.slice(0, this.cursor) + ch + tail
    this.cursor += ch.length
    if (tail.length === 0) {
      return ch
    }
    return ch + tail + cursorBack(tail.length)
  }

  // Delete the character before the cursor. No-op at position 0. At end of line
  // a simple destructive backspace ('\b \b') suffices; mid-line we step back,
  // erase to end of line, redraw the remainder, then restore the cursor.
  backspace(): string {
    if (this.cursor === 0) {
      return ''
    }
    const atEnd = this.cursor === this.text.length
    this.text =
      this.text.slice(0, this.cursor - 1) + this.text.slice(this.cursor)
    this.cursor -= 1
    if (atEnd) {
      return '\b \b'
    }
    const tail = this.text.slice(this.cursor)
    return '\b' + ERASE_TO_EOL + tail + cursorBack(tail.length)
  }

  // Forward-delete the character at the cursor. No-op at end of line. The
  // cursor does not move; we erase to end of line and redraw the new remainder.
  del(): string {
    if (this.cursor >= this.text.length) {
      return ''
    }
    this.text =
      this.text.slice(0, this.cursor) + this.text.slice(this.cursor + 1)
    const tail = this.text.slice(this.cursor)
    return ERASE_TO_EOL + tail + cursorBack(tail.length)
  }

  // Move the cursor one column left, clamped at the start of the line.
  left(): string {
    if (this.cursor === 0) {
      return ''
    }
    this.cursor -= 1
    return CUB
  }

  // Move the cursor one column right, clamped at the end of the line.
  right(): string {
    if (this.cursor >= this.text.length) {
      return ''
    }
    this.cursor += 1
    return CUF
  }

  // Jump the cursor to the start of the line.
  home(): string {
    const back = cursorBack(this.cursor)
    this.cursor = 0
    return back
  }

  // Jump the cursor to the end of the line.
  end(): string {
    const forward = this.text.length - this.cursor
    this.cursor = this.text.length
    return forward > 0 ? `\x1b[${forward}C` : ''
  }

  // Erase the visible line and reset text/cursor, WITHOUT touching the history
  // cursor. Used internally by replaceLine during history recall.
  private eraseLine(): string {
    const move = this.home()
    this.text = ''
    this.cursor = 0
    return move + ERASE_TO_EOL
  }

  // Reset the line to empty and exit any in-progress history recall, so the
  // next historyPrev starts again from the newest entry.
  clearLine(): string {
    this.historyIndex = -1
    return this.eraseLine()
  }

  // Push the current line onto history (if non-empty), return it, and reset
  // the line and history cursor. The returned value is the submitted text, not
  // an escape string.
  submit(): string {
    const line = this.text
    if (line.length > 0) {
      this.history.push(line)
    }
    this.text = ''
    this.cursor = 0
    this.historyIndex = -1
    return line
  }

  // Recall the previous (older) history entry, replacing the current line.
  // Walks backward from the most recent entry and stops at the oldest.
  historyPrev(): string {
    if (this.history.length === 0) {
      return ''
    }
    if (this.historyIndex === -1) {
      this.historyIndex = this.history.length - 1
    } else if (this.historyIndex > 0) {
      this.historyIndex -= 1
    }
    return this.replaceLine(this.history[this.historyIndex])
  }

  // Recall the next (newer) history entry, replacing the current line. Walking
  // past the most recent entry returns to a fresh, empty line.
  historyNext(): string {
    if (this.historyIndex === -1) {
      return ''
    }
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex += 1
      return this.replaceLine(this.history[this.historyIndex])
    }
    this.historyIndex = -1
    return this.replaceLine('')
  }

  // Replace the entire visible line with next: erase, then echo the new text.
  // Uses eraseLine (not clearLine) to preserve the history cursor.
  private replaceLine(next: string): string {
    const clear = this.eraseLine()
    this.text = next
    this.cursor = next.length
    return clear + next
  }
}

export default LineBuffer
