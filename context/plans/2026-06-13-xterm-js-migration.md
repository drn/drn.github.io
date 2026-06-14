# Plan: Migrate the terminal homepage to xterm.js

**Date:** 2026-06-13
**Source:** Approved design at `~/.claude/plans/optimized-growing-crayon.md` (xterm.js migration)
**Status:** Complete — `yarn tsc` clean, 25/25 tests pass, `yarn build` succeeds (implemented via workflow `wf_de6893be-91a`)
**Current Phase:** Done

## Goal

Replace the hand-rolled React terminal UI of `console.drn.dev` with real xterm.js, keeping the command-registry concept but switching the rendering contract from React JSX to ANSI strings.

## Background

The homepage is a fake interactive shell. Today a React `<input>` reads a line, an `Executor` dispatches to command classes, and each command returns **React JSX** rendered as `Row` components (with `react-anime` fade-ins, FontAwesome icons, and `<a>` links). The status bar is a separate React `Header` of `<span>`s + CSS.

xterm.js is the real terminal emulator used by VS Code. It draws a character grid from text + ANSI escape sequences — it cannot render React nodes — so this is a genuine rewrite of the I/O and output layer. The `Executor` + `Runnable`/`Nameable` registry is sound and kept; only the output contract changes (commands return ANSI **strings** instead of `ReactNode`).

## Requirements

### Must Have

- xterm.js (`@xterm/xterm`) hosts all terminal input and output, replacing the React `<input>` + `Row` rendering.
- All existing commands behave the same: `help`, `ls`, `cat README`, `whoami`, `clear`, and unknown → `zsh: command not found: <cmd>`.
- `whoami`/`help` rich output reproduced with the patched **Menlo Nerd Font** brand glyphs ( GitHub, LinkedIn) and **clickable** URLs via `WebLinksAddon` — FontAwesome + `react-anime` removed.
- Output streams as a **typewriter** effect (replaces the `react-anime` fade).
- Status bar rendered **inside the xterm buffer** as a fixed top row via a DECSTBM scroll region; live clock + responsive reflow on resize, ported from `Header.tsx`/`Header.css`.
- `yarn tsc` and `yarn test` pass; `yarn build` succeeds.

### Should Have

- Line editing the native `<input>` gave for free: backspace, ←/→, home/end.
- Command history recall via ↑/↓.
- Ctrl-C (abort line) and Ctrl-L (clear).

### Won't Do (this iteration)

- Recoloring the already-typed command red on failure (not terminal-native; failure now shown via red error output).
- Tab completion, multiple files for `cat`, dynamic `help` generation.
- WebGL renderer addon (optional perf; not required).
- Deploying (`yarn deploy` force-pushes `production` — out of scope).

## Technical Approach

Keep React only as the host for the xterm component (and router). New modules under `src/Terminal/`:

- `ansi.ts` — truecolor ANSI helpers mirroring the CSS theme + Nerd Font glyph constants.
- `LineBuffer.ts` — pure, DOM-free line editor (text + cursor + history) returning repaint escape strings; unit-tested.
- `statusBar.ts` — `renderStatusBar(cols)` (pure port of `Header.tsx`) + `mountStatusBar(term)` that sets the DECSTBM region (`\x1b[2;<rows>r`), redraws row 1 on a 1s interval and on `onResize`.
- `Shell.tsx` — the xterm host: loads font, creates `Terminal` with the theme, `FitAddon` + `WebLinksAddon`, drives a `LineBuffer` from `onData`, runs the `Executor`, typewriters results, repaints the prompt, auto-focuses.

`Executor` takes a `clear: () => void` callback instead of `setContents`; `Runnable.run()` returns `result?: string`. Commands import `ansi.ts`.

## Decisions

| Decision                                           | Rationale                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Nerd Font glyphs + `WebLinksAddon` for rich output | Closest visual match to the FontAwesome icons + links without leaving the text grid; lets us drop `@fortawesome/*`. |
| Typewriter effect instead of fade                  | xterm can't fade DOM; char streaming is terminal-native and replaces `react-anime`.                                 |
| Status bar inside xterm via DECSTBM                | User chose terminal-native rendering; a protected top row + scroll region is the canonical tmux/vim approach.       |
| Keep status bar at the **top** (region rows 2..N)  | Matches current visual placement (Header is top-fixed today).                                                       |
| Failure shown via red output, not recolored input  | A real terminal can't restyle already-typed text.                                                                   |
| Pure `LineBuffer` module                           | xterm is hard to unit-test in jsdom; isolating edit logic keeps coverage without the DOM.                           |
| `@xterm/*` scoped packages                         | The old `xterm`/`xterm-addon-*` packages are deprecated.                                                            |

## Implementation Steps

### Phase 1: Foundations

**Status:** complete (via workflow)

- [x] `package.json` — add `@xterm/xterm`, `@xterm/addon-fit`, `@xterm/addon-web-links`; remove `react-anime` + 4 `@fortawesome/*`
- [x] `src/Terminal/ansi.ts` — `RESET`, `fg`/`bg`, `FG`/`PROMPT`/`FAILURE`/`LINK`, `GITHUB`/`LINKEDIN`, `paint`
- [x] `src/Terminal/Executor/Runnable.tsx` — `result?: string`
- [x] `src/Terminal/Executor/index.tsx` — `clear: () => void` constructor arg
- [x] `src/Terminal/Executor/index.test.tsx` — assert clear callback + ANSI-stripped matches

### Phase 2: Parallel build

**Status:** complete (via workflow)

- [x] `src/Terminal/Executor/{Cat,Help,List,Whoami,Clear}.tsx` — return ANSI strings; whoami uses glyphs + cyan URLs
- [x] `src/Terminal/LineBuffer.ts` + `LineBuffer.test.ts` — pure editor + history, tested (15 tests)
- [x] `src/Terminal/statusBar.ts` — port of `Header` to ANSI + DECSTBM mount

### Phase 3: Integration

**Status:** complete

- [x] `src/Terminal/Shell.tsx` — xterm host wiring input/output/links/typewriter/status/focus
- [x] `src/Terminal/index.tsx` — render `<Shell />` only
- [x] `src/index.css` — keep `@font-face` + body; add full-viewport xterm container; import `@xterm/xterm/css/xterm.css`
- [x] `src/Terminal/Shell.test.tsx` — mocked-xterm smoke test (Enter→command-not-found, clear→reset)
- [x] Delete `Row.tsx`, `Row.test.tsx`, `Header.tsx`, `Header.css`, `Input.tsx`, `Input.css`, `Input.test.tsx`, `hooks/useWindowDimensions.tsx`

### Phase 4: Gate

**Status:** complete

- [x] `yarn install`
- [x] `yarn tsc` clean
- [x] `yarn test` green (25/25)
- [x] grep confirms no lingering imports of deleted modules
- [x] `yarn build` succeeds

## Testing Strategy

- `Executor/index.test.tsx` — unknown/empty → `command not found`; `clear` → `halt` + clear callback called; `whoami` contains `Darren`; `cat README` success; `cat nope` error string (strip ANSI before matching).
- `LineBuffer.test.ts` — insert/backspace/left/right/home/end clamping; submit empties + records; history prev/next walk.
- `Shell.test.tsx` — mock `@xterm/xterm`; drive captured `onData`: `bogus\r` writes `command not found`; `clear\r` calls `reset()`.
- Manual (`yarn start`): all commands; clickable whoami links + glyphs; typewriter + red errors; line editing + history; status bar pinned top, live clock, reflows on resize. `yarn build` succeeds.

## Risks & Open Questions

| Risk                                              | Mitigation                                                                                    |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| xterm fails to render/measure in jsdom tests      | Mock `@xterm/xterm` in `Shell.test.tsx`; keep edit logic in pure `LineBuffer`.                |
| Nerd Font glyph metrics off before font loads     | `await document.fonts.load('15px "Menlo Nerd Font"')` before `new Terminal`.                  |
| DECSTBM scroll region + cursor positioning quirks | Use DECSC/DECRC (`\x1b7`/`\x1b8`) save/restore around row-1 redraws; re-arm region on resize. |
| `yarn install` blocked by sandbox network         | Gate agent records and reports; tsc/test attempted regardless.                                |
| Column breakpoints (from px) mis-tuned            | Start at ~90/150 cols, flagged tunable; verify on resize.                                     |

- Confirm the `WebLinksAddon` recognizes URLs after typewriter streaming (full URL present in buffer → should be fine).
- Decide final per-char typewriter delay (snappy vs dramatic) during manual verification.

## Dependencies

- `@xterm/xterm`, `@xterm/addon-fit`, `@xterm/addon-web-links` (npm).
- Patched `src/assets/fonts/menlo-patched.otf` (already in repo) for brand glyphs.

## Errors Encountered

| Error | Attempt | Resolution |
| ----- | ------- | ---------- |

## Estimated Scope

**Phases:** 4
**Tasks:** ~22
**Files touched:** ~20 (5 new, ~8 modified, ~8 deleted)
