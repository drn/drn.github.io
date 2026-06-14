# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A personal homepage rendered as an interactive terminal emulator. Built with Vite (`@vitejs/plugin-react`), React 18, and TypeScript in strict mode. The terminal UI itself is **xterm.js** (`@xterm/xterm`) — React only hosts the xterm instance and the router. Served at `console.drn.dev` (see `CNAME`) / `drn.github.io`.

## Commands

```bash
yarn start          # dev server (vite)
yarn build          # production build (vite build) into build/
yarn preview        # serve the production build locally (vite preview)
yarn test           # run Vitest suite (vitest run)
yarn deploy         # build + publish (see Deploy below)
yarn tsc            # typecheck via node_modules/.bin/tsc (noEmit) — NOT a package.json script
```

`yarn test` runs the Vitest suite (`vitest run`). Tests live alongside source files as `*.test.ts`/`*.test.tsx` (e.g. `src/Terminal/Executor/index.test.tsx`, `src/Terminal/LineBuffer.test.ts`). `Shell.test.tsx` mocks `@xterm/xterm` (xterm can't measure a real grid under jsdom), so terminal-edit logic that needs real coverage lives in the pure `LineBuffer`. CI's "test" job runs `yarn tsc` then `yarn test`. `yarn tsc` is not a defined script; Yarn resolves it to the `tsc` binary in `node_modules/.bin`. ESLint is configured (`.eslintrc.cjs`) but there is no `lint` script. Formatting is enforced by Prettier via the Husky `.husky/pre-commit` hook (`pretty-quick --staged`).

Vite config lives in `vite.config.ts` (`react()` plugin, `build.outDir = 'build'`, `sourcemap: false`, Vitest `setupFiles`). The HTML entry is `/index.html` at the repo root, which loads `/src/index.tsx`; `public/` is Vite's static asset dir (icons, manifest) served at `/`. The `.env` (`GENERATE_SOURCEMAP=false`) is a leftover CRA file — sourcemaps are now controlled by `vite.config.ts`.

Node: `.tool-versions` and CI (`.circleci/config.yml`) both pin 22.15.0.

## Architecture

The app is a single-page React Router app (`src/App.tsx`); the main route `/` renders the `Terminal` (`src/Terminal/index.tsx`), which renders `Shell` — the interactive shell UI.

### Shell (xterm.js host)

`src/Terminal/Shell.tsx` owns the xterm.js `Terminal`. On mount it waits for the patched `'Menlo Nerd Font'` to load (so the character grid measures correctly), creates the terminal with the theme colors, and loads two addons: `FitAddon` (sizes the grid to the container, re-fit on `ResizeObserver`/window resize) and `WebLinksAddon` (makes printed URLs clickable). Output is **text + ANSI escape sequences** — xterm cannot render React nodes.

Input is driven by `term.onData`: a pure, DOM-free **`LineBuffer`** (`src/Terminal/LineBuffer.ts`) tracks the current line + cursor + history and returns the escape strings to repaint. Enter submits the line to the `Executor`; results are streamed with a **typewriter** effect (per-char delay, red for failures). Line editing supports backspace, ←/→, ↑/↓ history, Ctrl-C (abort), and Ctrl-L (clear).

The **status bar** (`src/Terminal/statusBar.ts`, ported from the old React `Header`) is drawn inside the xterm buffer: `mountStatusBar` sets a DECSTBM scroll region protecting the top row (`\x1b[2;<rows>r`), then `renderStatusBar(cols)` paints row 1 on a 1s interval and on resize. ANSI helpers (truecolor `fg`/`bg`, theme color + Nerd Font glyph constants, `paint`) live in `src/Terminal/ansi.ts`.

### Terminal command system

The `Executor` (`src/Terminal/Executor/index.tsx`) constructs each registered command, keying it by its `name`, then on each run parses input into `{ command, arguments }` (split on spaces) and dispatches to the matching command. Unknown commands return `zsh: command not found: …`.

Commands implement two interfaces (`Runnable`, `Nameable`):

- `name: string` — the command word typed in the terminal
- `run(args: string[])` → `{ success, result?, builtins? }` where `result` is an **ANSI string** (use `ansi.ts` helpers for color / glyphs / links; separate lines with `\r\n`)

**To add a command:** create a class in `src/Terminal/Executor/` implementing `Runnable, Nameable`, then add it to the `commands` array in `src/Terminal/Executor/index.tsx`. Existing examples: `Cat`, `Clear`, `Help`, `List` (`ls`), `Whoami`.

**Built-in side effects:** a command can return `builtins: ['clear']` to trigger a side effect handled by `Executor.builtin()`. The `Executor` is constructed with a `clear: () => void` callback (`Shell` passes one that resets the terminal, re-mounts the status bar, and reprints the prompt). When a command returns builtins, the run `halt`s and no output is streamed.

## Deploy

`yarn deploy` runs `./deploy`, which: aborts on a dirty tree, builds, **destructively replaces the working tree with `build/` contents** (`rm -rf public src yarn.lock README.md deploy`), commits, force-pushes to `upstream HEAD:production`, then `git reset --hard HEAD^` to restore source. The CircleCI `deploy` job only triggers on the `production` branch. Be careful editing `deploy` — it deletes source files in the working copy as a normal part of operation.

## Conventions

Prettier (`.prettierrc`): no semicolons, single quotes, trailing commas everywhere, 80-col width. TypeScript `strict` is on. `lodash` is used throughout (imported as `_`).
