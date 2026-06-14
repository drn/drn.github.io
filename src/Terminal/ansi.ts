// Dependency-free ANSI escape-sequence helpers for xterm.js rendering.

export const RESET = '\x1b[0m'

// Parses a #rrggbb hex string into [r, g, b].
const parseHex = (hex: string): [number, number, number] => {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return [r, g, b]
}

// Truecolor foreground escape sequence from a #rrggbb hex.
export const fg = (hex: string): string => {
  const [r, g, b] = parseHex(hex)
  return `\x1b[38;2;${r};${g};${b}m`
}

// Truecolor background escape sequence from a #rrggbb hex.
export const bg = (hex: string): string => {
  const [r, g, b] = parseHex(hex)
  return `\x1b[48;2;${r};${g};${b}m`
}

// Named theme colors (foreground escape sequences).
export const FG = fg('#bcbbbb')
export const PROMPT = fg('#1291ff')
export const FAILURE = fg('#fb5655')
export const LINK = fg('#19babb')

// Nerd Font brand glyphs.
export const GITHUB = ''
export const LINKEDIN = ''

// Wraps text in a color escape sequence and resets afterward.
export const paint = (text: string, colorCode: string): string =>
  `${colorCode}${text}${RESET}`
