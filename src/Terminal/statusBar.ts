// ANSI status bar drawn on the protected top row of an xterm.js terminal.
// Ports the React Header (Header.tsx + Header.css) into a single-line,
// powerline-styled status bar rendered with truecolor SGR sequences.

import moment from 'moment'
import { RESET, bg, fg, stripAnsi } from './ansi'

// Palette ported verbatim from Header.css.
const PURPLE = '#74729f' // color1 background
const GRAY = '#3e3d3d' // color2 background / color3 foreground
const DARK = '#1e1d1e' // header / color3 background
const INK = '#242424' // color1 foreground
const TEXT = '#bcbbbb' // color2 foreground

// Powerline separator glyphs (see Header.tsx comments).
const SOLID_RIGHT = '⮀' // &#x2B80; solid right-pointing
const EMPTY_RIGHT = '⮁' // &#x2B81; empty right-pointing

// Responsive breakpoints converted from pixels to columns.
// Header.tsx used <800px and <1200px; at a 15px Menlo cell these map to
// roughly 90 and 150 columns. These are tunable.
const NARROW_COLS = 90
const WIDE_COLS = 150

// color1 segment: ink-on-purple
const color1 = (text: string): string => bg(PURPLE) + fg(INK) + text
// color2 segment: text-on-gray
const color2 = (text: string): string => bg(GRAY) + fg(TEXT) + text
// color3 segment: gray-on-dark
const color3 = (text: string): string => bg(DARK) + fg(GRAY) + text

// Powerline separators: foreground = the color being left, background = the
// color being entered, matching the colorX_Y classes in Header.css.
const sep = (fromBg: string, toBg: string): string =>
  bg(toBg) + fg(fromBg) + SOLID_RIGHT

const cpu = (): string => '3%c'
const mem = (): string => '13%m'
const bat = (): string => '100%b'

const formatTime = (): string => moment().format('h:mm:ssa')

const formatDate = (): string =>
  moment().format('ddd D ') +
  String.fromCharCode(11139) +
  moment().format('MMM YYYY')

const visibleWidth = (text: string): number => stripAnsi(text).length

// Builds the left segment group for the given column width.
const buildLeft = (cols: number): string => {
  if (cols < NARROW_COLS) {
    return (
      color1(' master ' + EMPTY_RIGHT + ' * ') +
      bg(DARK) +
      fg(PURPLE) +
      SOLID_RIGHT
    )
  }
  if (cols < WIDE_COLS) {
    return (
      color1(' master ' + EMPTY_RIGHT + ' * ') +
      sep(PURPLE, DARK) +
      color3(' 192.168.1.1 ')
    )
  }
  return (
    color1(' master ' + EMPTY_RIGHT + ' * ') +
    sep(PURPLE, GRAY) +
    color2(' Thanx ') +
    sep(GRAY, DARK) +
    color3(' 192.168.1.1 ')
  )
}

// Builds the center segment group (always '1 core').
const buildCenter = (): string =>
  sep(DARK, PURPLE) + color1(' 1 core ') + bg(DARK) + fg(PURPLE) + SOLID_RIGHT

// Builds the right segment group for the given column width.
const buildRight = (cols: number): string => {
  const time = formatTime()
  if (cols < NARROW_COLS) {
    return sep(DARK, PURPLE) + color1(' ' + time + ' ')
  }
  if (cols < WIDE_COLS) {
    return (
      color3(' ' + cpu() + ' ' + mem() + ' ' + bat() + ' ') +
      sep(DARK, PURPLE) +
      color1(' ' + time + ' ')
    )
  }
  return (
    color3(' ' + cpu() + ' ' + mem() + ' ' + bat() + ' ') +
    sep(DARK, GRAY) +
    color2(' ' + formatDate() + ' ') +
    sep(GRAY, PURPLE) +
    color1(' ' + time + ' ')
  )
}

// Pure: returns a single status line whose visible width is exactly `cols`,
// padding the gap between segment groups (or truncating) to fit.
export const renderStatusBar = (cols: number): string => {
  const left = buildLeft(cols)
  const center = buildCenter()
  const right = buildRight(cols)

  const leftW = visibleWidth(left)
  const centerW = visibleWidth(center)
  const rightW = visibleWidth(right)

  // Center the center group; fill remaining space with dark background.
  const centerStart = Math.max(leftW, Math.floor((cols - centerW) / 2))
  const leftPad = Math.max(0, centerStart - leftW)
  const afterCenter = centerStart + centerW
  const rightStart = Math.max(afterCenter, cols - rightW)
  const midPad = Math.max(0, rightStart - afterCenter)

  const fill = (count: number): string => bg(DARK) + ' '.repeat(count)

  let line = left + fill(leftPad) + center + fill(midPad) + right + RESET

  // Truncate to the requested column count if segments overflow.
  if (visibleWidth(line) > cols) {
    let width = 0
    let out = ''
    let i = 0
    while (i < line.length && width < cols) {
      if (line[i] === '\x1b') {
        // eslint-disable-next-line no-control-regex
        const match = line.slice(i).match(/^\x1b\[[0-9;]*m/)
        if (match) {
          out += match[0]
          i += match[0].length
          continue
        }
      }
      out += line[i]
      width += 1
      i += 1
    }
    line = out + RESET
  }

  return line
}

interface XtermLike {
  cols: number
  rows: number
  write(data: string): void
  onResize(handler: () => void): { dispose: () => void }
}

// Mounts the live status bar onto an xterm Terminal: protects the top row via
// a DECSTBM scroll region (rows 2..rows), redraws the clock every second, and
// re-arms on resize. Caller must move the cursor into the scroll region
// (row 2+) after mount before printing content.
export const mountStatusBar = (
  term: XtermLike,
): { redraw: () => void; dispose: () => void } => {
  const armRegion = (): void => term.write('\x1b[2;' + term.rows + 'r')

  const redraw = (): void => {
    term.write('\x1b7' + '\x1b[1;1H' + renderStatusBar(term.cols) + '\x1b8')
  }

  armRegion()
  redraw()

  const timer = setInterval(redraw, 1000)
  const resize = term.onResize(() => {
    armRegion()
    redraw()
  })

  const dispose = (): void => {
    clearInterval(timer)
    resize.dispose()
  }

  return { redraw, dispose }
}
