// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

// eslint-disable-next-line no-control-regex
const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, '')

// Captures the most recently constructed fake Terminal so tests can drive its
// onData handler and inspect its recorded writes. Defined via vi.hoisted so the
// class and holder exist before vi.mock factories run (both are hoisted).
const { FakeTerminal, termHolder } = vi.hoisted(() => {
  class FakeTerminal {
    cols = 80
    rows = 24
    writes: string[] = []
    onDataHandler: ((data: string) => void) | null = null
    reset = vi.fn()
    focus = vi.fn()
    open = vi.fn()
    loadAddon = vi.fn()
    dispose = vi.fn()

    constructor() {
      termHolder.last = this
    }

    write(data: string): void {
      this.writes.push(data)
    }

    onData(handler: (data: string) => void): { dispose: () => void } {
      this.onDataHandler = handler
      return { dispose: vi.fn() }
    }

    onResize(): { dispose: () => void } {
      return { dispose: vi.fn() }
    }
  }

  const termHolder: { last: FakeTerminal | null } = { last: null }

  return { FakeTerminal, termHolder }
})

vi.mock('@xterm/xterm', () => ({
  Terminal: FakeTerminal,
}))

vi.mock('@xterm/xterm/css/xterm.css', () => ({}))

vi.mock('@xterm/addon-fit', () => ({
  FitAddon: class {
    fit = vi.fn()
  },
}))

vi.mock('@xterm/addon-web-links', () => ({
  WebLinksAddon: class {},
}))

// Import after mocks are registered.
import Shell from './Shell'

const renderShell = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  act(() => {
    createRoot(container).render(<Shell />)
  })
  return container
}

const flush = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0))

const feed = (data: string): void => {
  for (const ch of data) {
    termHolder.last!.onDataHandler!(ch)
  }
}

describe('Shell', () => {
  beforeEach(() => {
    termHolder.last = null
    document.body.innerHTML = ''
    ;(globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        load: vi.fn().mockResolvedValue([]),
      },
    })
  })

  it('writes command-not-found for an unknown command', async () => {
    renderShell()
    await flush()

    feed('bogus')
    termHolder.last!.onDataHandler!('\r')
    // Wait out the per-character typewriter streaming.
    await new Promise((resolve) => setTimeout(resolve, 500))

    const joined = stripAnsi(termHolder.last!.writes.join(''))
    expect(joined).toContain('command not found')
  })

  it('calls reset() when the clear command runs', async () => {
    renderShell()
    await flush()

    feed('clear')
    termHolder.last!.onDataHandler!('\r')
    await flush()

    expect(termHolder.last!.reset).toHaveBeenCalled()
  })

  it('disposes the prior status-bar interval when clearing', async () => {
    renderShell()
    await flush()

    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    feed('clear')
    termHolder.last!.onDataHandler!('\r')
    await flush()

    // The clear callback must dispose the old status bar (clearing its 1s
    // redraw interval) before mounting a fresh one — otherwise timers leak.
    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })

  it('aborts the current line on Ctrl-C without running it', async () => {
    renderShell()
    await flush()

    feed('abc')
    termHolder.last!.onDataHandler!('\x03')
    await flush()
    // Enter now acts on a fresh, empty line — the aborted 'abc' must not run.
    termHolder.last!.onDataHandler!('\r')
    await flush()

    const joined = stripAnsi(termHolder.last!.writes.join(''))
    expect(joined).toContain('^C')
    expect(joined).not.toContain('command not found: abc')
  })

  it('resets the line buffer on Ctrl-L so no stale input survives', async () => {
    renderShell()
    await flush()

    // Type some text, then Ctrl-L (clears screen). The buffer must be reset,
    // so the next command runs alone — not concatenated with the stale text.
    feed('wxyz')
    termHolder.last!.onDataHandler!('\x0c')
    await flush()

    feed('ls')
    termHolder.last!.onDataHandler!('\r')
    await new Promise((resolve) => setTimeout(resolve, 300))

    const joined = stripAnsi(termHolder.last!.writes.join(''))
    expect(joined).toContain('README')
    expect(joined).not.toContain('command not found')
  })
})
