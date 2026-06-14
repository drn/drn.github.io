import React, { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import Executor from './Executor'
import LineBuffer from './LineBuffer'
import { mountStatusBar } from './statusBar'
import { FAILURE, FG, PROMPT, RESET, paint } from './ansi'

// Blue '❯ ' prompt printed at the start of every input line.
const PROMPT_STRING = paint('❯ ', PROMPT)

// Per-character delay (ms) for the streaming typewriter output.
const TYPE_DELAY = 6

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

// Streams a result string into the terminal so output appears to type itself.
// ANSI escape sequences are written atomically (never split across the delay,
// which would flicker), and the base color is re-asserted after any embedded
// RESET so the remainder keeps its intended color. Stops early once
// shouldAbort() returns true (e.g. the user pressed Ctrl-C mid-stream).
const typewriter = async (
  term: Terminal,
  text: string,
  colorCode: string,
  shouldAbort: () => boolean,
): Promise<void> => {
  term.write(colorCode)
  let i = 0
  while (i < text.length) {
    if (shouldAbort()) {
      break
    }
    if (text[i] === '\x1b') {
      // eslint-disable-next-line no-control-regex
      const escape = text.slice(i).match(/^\x1b\[[0-9;]*[A-Za-z]/)
      if (escape) {
        term.write(escape[0])
        if (escape[0] === RESET) {
          term.write(colorCode)
        }
        i += escape[0].length
        continue
      }
    }
    term.write(text[i])
    await sleep(TYPE_DELAY)
    i += 1
  }
  term.write(RESET)
}

const Shell = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    let term: Terminal | null = null
    let sb: { redraw: () => void; dispose: () => void } | null = null
    let resizeObserver: ResizeObserver | null = null
    let disposed = false

    const focus = () => {
      if (term) {
        term.focus()
      }
    }

    const onWindowResize = () => {
      fit.fit()
    }

    const fit = new FitAddon()

    const start = async () => {
      // Ensure the patched Nerd Font is loaded before measuring the cell grid.
      await document.fonts.load('15px "Menlo Nerd Font"')
      if (disposed) {
        return
      }

      term = new Terminal({
        fontFamily: 'Menlo Nerd Font, monospace',
        fontSize: 15,
        cursorBlink: true,
        theme: {
          background: '#08082a',
          foreground: '#bcbbbb',
          cursor: '#c82864',
        },
      })

      term.loadAddon(fit)
      term.loadAddon(new WebLinksAddon())
      term.open(container)
      fit.fit()

      sb = mountStatusBar(term)

      const lineBuffer = new LineBuffer()

      // Drop the cursor onto the first row of the scroll region (row 2, just
      // below the protected status bar) and print the prompt there.
      const printPrompt = () => {
        term!.write('\x1b[2;1H' + PROMPT_STRING)
      }
      printPrompt()

      const executor = new Executor(() => {
        // Visually clear, restore the protected status bar, and reprint. Dispose
        // the previous status bar first so repeated clears don't leak intervals.
        if (sb) {
          sb.dispose()
        }
        term!.reset()
        sb = mountStatusBar(term!)
        printPrompt()
      })

      let running = false
      let aborted = false

      const submit = async () => {
        if (running) {
          return
        }
        term!.write('\r\n')
        const command = lineBuffer.submit()
        const res = executor.run(command)
        if (res.halt) {
          // clear() already reprinted the prompt; nothing more to do.
          return
        }
        running = true
        aborted = false
        if (res.result) {
          await typewriter(
            term!,
            res.result,
            res.success ? FG : FAILURE,
            () => aborted,
          )
        }
        running = false
        term!.write('\r\n' + PROMPT_STRING)
      }

      term.onData((data) => {
        if (running) {
          // Let Ctrl-C interrupt streaming output; drop other keys.
          if (data === '\x03') {
            aborted = true
          }
          return
        }
        switch (data) {
          case '\r':
            submit()
            return
          case '\x7f':
            term!.write(lineBuffer.backspace())
            return
          case '\x1b[C':
            term!.write(lineBuffer.right())
            return
          case '\x1b[D':
            term!.write(lineBuffer.left())
            return
          case '\x1b[A':
            term!.write(lineBuffer.historyPrev())
            return
          case '\x1b[B':
            term!.write(lineBuffer.historyNext())
            return
          case '\x1b[3~':
            term!.write(lineBuffer.del())
            return
          case '\x1b[H':
          case '\x1bOH':
            term!.write(lineBuffer.home())
            return
          case '\x1b[F':
          case '\x1bOF':
            term!.write(lineBuffer.end())
            return
          case '\x03':
            // Abort the line like a real shell: move to the end of the typed
            // text so ^C always appends there (even when editing mid-line),
            // then drop to a fresh prompt and reset the buffer. The typed text
            // stays visible above, as in a real shell.
            term!.write(lineBuffer.end())
            lineBuffer.clearLine()
            term!.write('^C\r\n' + PROMPT_STRING)
            return
          case '\x0c':
            // Ctrl-L clears the screen; reset the buffer so no stale input
            // survives the reset.
            lineBuffer.clearLine()
            executor.run('clear')
            return
          default:
            if (data >= '\x20') {
              term!.write(lineBuffer.insert(data))
            }
        }
      })

      term.focus()
      document.body.addEventListener('click', focus)

      resizeObserver = new ResizeObserver(() => {
        fit.fit()
      })
      resizeObserver.observe(container)
      window.addEventListener('resize', onWindowResize)
    }

    start()

    return () => {
      disposed = true
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      window.removeEventListener('resize', onWindowResize)
      document.body.removeEventListener('click', focus)
      if (sb) {
        sb.dispose()
      }
      if (term) {
        term.dispose()
      }
    }
  }, [])

  return <div className="shell" ref={containerRef} />
}

export default Shell
