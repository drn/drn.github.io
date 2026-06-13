# drn.github.io — Codebase Review & Improvement Backlog

**Date:** 2026-06-12 · **Reviewer:** Claude Code · **Scope:** full codebase
assessment (findings + recommendations, not a PR) · **Branch:**
`drn/codebase-review-2026-06-12` off `origin/master` @ `502f257`.

This is a personal homepage rendered as an interactive terminal emulator
(`console.drn.dev`): a static SPA built with Create React App (react-scripts
5.0.1), React 17.0.2, TypeScript strict. No backend, no auth, no user data, no
forms. **That "static toy site" framing drives every priority below** — most of
the scary-looking findings are low real-risk, and the right moves are a handful
of small structural cleanups rather than a big rewrite.

---

## TL;DR — recommended order of work

| #   | Item                                                      | Effort | Value   | Verdict                                            |
| --- | --------------------------------------------------------- | ------ | ------- | -------------------------------------------------- |
| 1   | Remove Spotify/Slack OAuth-clipboard flow (owner-decided) | S      | High    | **Do now**                                         |
| 2   | Delete dead deps & dead config exposed by #1              | S      | Med     | **Do now** (with #1)                               |
| 3   | Align Node: CI 16.14.2 → 22.x                             | XS     | Med     | **Do now**                                         |
| 4   | React 17 → 18 (`createRoot`)                              | S      | Med     | **Do**                                             |
| 5   | Reframe & triage the "62 Dependabot vulns"                | S      | Med     | **Do** (mostly let auto-merge run)                 |
| 6   | CRA → Vite migration                                      | M      | High    | **Recommend** (resolves the vuln-noise root cause) |
| 7   | Minimal test setup (Executor dispatch)                    | S      | Med     | **Recommend**                                      |
| 8   | Fix latent correctness/perf nits in Terminal              | S      | Low–Med | Opportunistic                                      |
| 9   | **xterm.js migration**                                    | L      | —       | **Reject — wrong tool for this app**               |
| 10  | React 18 → 19                                             | M      | Low     | Defer (do after Vite, if ever)                     |

Effort: XS<1h · S≈half-day · M≈1–2 days · L≈multi-day.

---

## Headline question: should `src/Terminal/` be replaced with xterm.js?

**No. Recommend against.** xterm.js solves a problem this app doesn't have, and
breaks the one thing this app actually does.

What this "terminal" really is: a fixed set of ~6 React components keyed by a
command word. `Executor.run()` parses `input` into `{command, arguments}`,
dispatches to a registered class, and each command's `run()` returns
**`result: React.ReactNode`** — real JSX: `<a>` links, `<FontAwesomeIcon>`
GitHub/LinkedIn icons (`Whoami`), `react-anime` fade animations (`Row`), lists
(`Help`). `Input.tsx` renders those nodes directly into the DOM as React rows.

What xterm.js is: a faithful VT/xterm **terminal emulator** — it parses ANSI
escape sequences and renders **text** to a canvas/WebGL/DOM grid. It has no
concept of a React node. To keep the existing links, icons, and animations
you'd have to either (a) abandon them for ANSI-colored plaintext, or (b) bolt
on a DOM-overlay hack to float React on top of the canvas grid — strictly worse
than what exists today.

|                                    | Hand-rolled (current)                 | xterm.js                        |
| ---------------------------------- | ------------------------------------- | ------------------------------- |
| Renders                            | React nodes (links, icons, animation) | ANSI text to canvas/DOM grid    |
| Fit for "commands that return JSX" | Native                                | Requires abandoning JSX output  |
| Bundle cost                        | ~0 (already there)                    | +~250KB for unused VT machinery |
| Cursor/escape-seq/PTY fidelity     | None (not needed)                     | Full (not needed)               |
| Maintenance                        | Tiny, owned                           | New dep + addon ecosystem       |

xterm.js is the right call when you're driving a **real** shell/PTY/SSH session
(ANSI streams, cursor addressing, resize). This app renders a curated set of
rich React responses. The current `Runnable`/`Nameable` + `Executor` pattern is
small, typed, and an appropriate fit. **Keep it.** (If anything itches, the
worthwhile micro-investments are in finding #8, not a rewrite.)

---

## P1 — Remove the Spotify/Slack OAuth-clipboard flow _(owner-decided)_

Already removed from docs; code remains. This is also **partly dead already**:
`src/Terminal/index.tsx` reads `params.code`/`params.state` via `useParams()`,
but the `/` route (`App.tsx:11`) declares **no** path params — so `code`/`state`
are always `''` and the `spotify <code>` pre-fill in `Input.tsx:16-17` can never
fire. The `/slack/callback` route's `useParams().code` is similarly empty.

**Delete:**

- `src/Terminal/Executor/Spotify.tsx` and its `Spotify` entries in
  `Executor/index.tsx` (`import` line 8, `commands` array line 10).
- `src/Slack/` (`index.tsx` + `index.css`); the `Slack` import and
  `/slack/callback` route in `src/App.tsx` (lines 4, 10).
- The `code`/`state` plumbing: `useParams`/`QueryString` in
  `src/Terminal/index.tsx`, and the `code`/`state` props +
  `initialInputValue`/`defaultValue` pre-fill in `src/Terminal/Input.tsx`.
  `Terminal` then takes no props and `Input` needs none.

**Verification gate:** `yarn tsc` clean + `yarn build` succeeds. (Note CI's
"test" job is just `yarn tsc` — there are no Jest tests to break.)

---

## P2 — Delete dead dependencies & dead config

**Confirmed-dead regardless of P1** (grepped `src/` — zero imports):

- `react-bootstrap` — never imported anywhere. Remove.
- `precise-commits` (devDep) — never referenced; the active hook is
  `.husky/pre-commit` → `pretty-quick --staged`. Remove.
- The stale `husky: { hooks: { pre-commit: "lint-staged" } }` block **and** the
  `lint-staged` config block in `package.json` (lines 46–56). Husky v8 ignores
  these; the real hook is the `.husky/pre-commit` file. `lint-staged` (devDep,
  line 41) is also unused — remove it too.
- Root `webpack.config.js` and `babel.config.js` — **vestigial**. CRA owns its
  own webpack/babel config and ignores these unless ejected (the app is not
  ejected). Confirmed they aren't referenced. Remove both. _(If you migrate to
  Vite — finding #6 — Vite supplies its own config and these stay deleted.)_

**Becomes removable only after P1** (verify no other import first):

- `copy-to-clipboard` — only `Spotify.tsx` + `Slack/index.tsx` use it.
- `query-string` — only `Slack/index.tsx` uses it; the `Terminal/index.tsx`
  import is **already unused** today (imported, never referenced).

**Keep — do NOT remove** (the handoff flagged these as "likely" removable, but
they're live):

- `react-anime` — still used by `src/Terminal/Row.tsx` (row fade-in) after Slack
  is gone. Stays.
- `moment` — used by `Header.tsx`. Stays (but see #8 for an optional swap).

---

## P3 — Align Node versions _(XS, do immediately)_

`.tool-versions` pins **22.15.0**; `.circleci/config.yml` pins **16.14.2** (in
two `node/install` steps). Node 16 is EOL (Sept 2023). Bump CI to `22.15.0` to
match local. Trivial, removes a latent "works on my machine" gap and lets newer
tooling run in CI.

---

## P4 — React 17 → 18 _(S, recommended)_

Single material touchpoint: `src/index.tsx` uses the React 17 API
`ReactDOM.render(<App/>, root)`, removed in 18. Migrate to:

```tsx
import { createRoot } from 'react-dom/client'
createRoot(document.getElementById('root')!).render(<App />)
```

Bump `react`, `react-dom`, `@types/react`, `@types/react-dom` to 18.x.
react-scripts 5 supports React 18, so this works without the Vite migration. The
app uses only function components + hooks (no legacy lifecycles, no
`findDOMNode`, no string refs) so concurrent-mode risk is minimal. **Watch:**
React 18 StrictMode double-invokes effects in dev — the `Header` interval and
`Input` body-click listener (finding #8) should be verified to clean up
correctly (they do, via their `useEffect` returns).

**Do not jump straight to React 19** (finding #10): it's more churn for no user
benefit here, and is best sequenced _after_ Vite so you're not fighting CRA's
pinned toolchain at the same time.

---

## P5 — Reframe and triage the "62 Dependabot vulnerabilities"

Current open alerts: **1 critical, 30 high, 23 moderate, 8 low = 62**. The
headline overstates real risk. I enumerated every critical/high alert: **all of
them are in build-time tooling** — transitive deps of `react-scripts`
(webpack, rollup, babel plugins, `loader-utils`, `svgo`, `nth-check`,
`minimatch`, `serialize-javascript`, `shell-quote` [the lone critical],
`cross-spawn`, `json5`, `node-forge`, `ws`, `path-to-regexp`, `semver`).

For a **static SPA with no server**:

- None of these execute in the deployed site — they run only during
  `yarn build` in CI/local, on input the maintainer controls.
- The advisory classes are ReDoS / DoS / prototype-pollution / dev-server
  issues — not exploitable against a built static bundle.
- The one _runtime_ dependency with an advisory is **`lodash`** (`_.template`
  code injection). The app imports `_` but **never calls `_.template`**
  (only `_.each`/`_.map`), so it's not reachable. Still, bump it (PR #937 does:
  4.17.23 → 4.18.1).

**Recommendation — don't hand-bump 62 things:**

1. Let the existing `auto-merge.yml` keep landing the minor/patch Dependabot PRs
   (16 are open right now, e.g. #937 lodash, #936 node-forge, #938
   follow-redirects, #928 webpack). They're low-risk and self-clearing.
2. Manually merge the few **major**-version Dependabot PRs that auto-merge skips
   (it's `target: minor`): FontAwesome 5→7 (#929/#930/#931), eslint 8→9 (#927),
   query-string 7→9 (#911 — moot once #2 removes the dep), husky 8→9 (#863).
   Smoke-test FontAwesome icons (`whoami`) after its bump.
3. **The structural fix is finding #6.** ~90% of these alerts vanish when
   `react-scripts` (and its webpack/rollup/babel transitive tree) is replaced by
   Vite. Treat the Vite migration as the real remediation; treat individual
   bumps as interim hygiene.

_Also flagged (low risk, worth tightening):_ `.github/workflows/auto-merge.yml`
uses the `pull_request_target` trigger and `actions/checkout@v2` (Node 12,
deprecated). It's gated to `dependabot[bot]` and doesn't build PR code, so
exposure is limited, but pin to `@v4` and consider GitHub's native Dependabot
auto-merge (`gh pr merge --auto`) instead of a third-party action holding
`AUTO_MERGE_TOKEN`.

---

## P6 — CRA → Vite migration _(M, recommended — strategic)_

CRA / `react-scripts` is effectively unmaintained (no release since 5.0.1, early 2022) and is the **root cause** of the dependency-vuln noise (P5) and the slow
dev/build experience. Vite is actively maintained, far faster, and has a small
config surface.

- **Effort:** moderate for an app this small. Add `vite` + `@vitejs/plugin-react`,
  move `public/index.html` → root `index.html` with a `<script
type="module" src="/src/index.tsx">`, swap `react-scripts` scripts for
  `vite` / `vite build` / `vite preview`, and translate the `.env`
  `GENERATE_SOURCEMAP=false` to Vite's `build.sourcemap: false`. The
  `homepage`/`browserslist` fields and CRA's `react-app-env.d.ts` get replaced
  by Vite's `vite/client` types.
- **Payoff:** removes the entire webpack/babel-loader/rollup-via-CRA tree →
  clears the bulk of the 62 alerts; sub-second HMR; modern toolchain.
- **Watch:** `./deploy` does `rm -rf … && cp -r build/* .` — Vite outputs to
  `dist/` by default, so either set `build.outDir = 'build'` or update `deploy`.
  Don't forget the `CNAME` file must survive into the published output.

Sequence: do this **after** P1–P4 (smaller diffs, easier to bisect), and treat
React 19 (P10) as an optional follow-up once on Vite.

---

## P7 — Minimal test coverage _(S, recommended)_

Currently **zero** tests; CI's "test" job runs `yarn tsc` (typecheck) as the
real gate. The highest-value, most-testable unit is the command dispatch in
`src/Terminal/Executor/index.tsx`:

- `run('whoami')` → `{success: true, result: <node>}`
- `run('clear')` → `{halt: true, success: true}` and `setContents([])` called
- `run('bogus')` → `{success: false, result: 'zsh: command not found: bogus'}`
- `parse('cat README foo')` → `{command:'cat', arguments:['README','foo']}`

If migrating to Vite, pair with **Vitest** (zero-config, Jest-compatible API).
On current CRA, `react-scripts test` + React Testing Library already works — the
infra exists; only the spec files are missing. A handful of pure-logic tests
here would meaningfully protect the one piece of real logic in the app.

---

## P8 — Latent correctness / perf nits _(opportunistic, low risk)_

Not bugs users hit today, but worth fixing while in the files:

1. **`Executor.run()` return type lies.** It's declared
   `result: string | null` but actually returns `React.ReactNode` (the
   `Runnable` interface uses `result?: any`). Tighten to `React.ReactNode` and
   drop the `any` in `Runnable`/command signatures for real type safety.
2. **`new Executor(setContents)` is constructed on every `Input` render**
   (`Input.tsx:15`) — re-registers all commands each keystroke-driven re-render.
   Wrap in `useMemo`/`useRef`.
3. **`Input` focus effect has no dependency array** (`Input.tsx:19-25`) — it
   adds/removes the `document.body` click listener on _every_ render. Give it
   `[inputRef]` (or `[]` with a ref).
4. **Stale-closure on `contents`** in `Input.run` (`Input.tsx:64`): uses
   `setContents([...contents, …])` from the render closure. Use the functional
   form `setContents(prev => [...prev, …])` to be robust to batching.
5. **`Header` re-renders every 500ms** (`setInterval`, line 23) though the
   displayed time only changes each second; `cpu()/mem()/bat()` return hardcoded
   fake strings (`'3%c'` etc.). Cosmetic for a toy, but the 500ms interval is
   needless churn — 1000ms is enough.
6. **`deploy` comment is stale:** says "Deploys … to upstream/master" but it
   force-pushes to `production`. Fix the comment (the script is correct).
7. **`onKeyPress` is deprecated** (`Input.tsx:49`); prefer `onKeyDown` for
   Enter handling (you already use `onKeyDown` for Tab — consolidate).

---

## P9 — xterm.js: **rejected** (see headline section above).

## P10 — React 18 → 19 _(defer)_

Possible but low-value here: no Server Components, no `use()`/Actions, no Suspense
data-fetching in this app to benefit from. More churn (e.g. ref-as-prop, removed
`propTypes`/`defaultProps` on function components — none used here, so low risk,
low reward). **Defer** until after Vite, and only if you want to stay current;
React 18 is the pragmatic stopping point.

---

## Suggested PR sequencing (rebase-only repo)

The repo is **rebase-only** (squash/merge-commit disabled). Keep PRs small and
stacked/sequential:

1. **PR A** — Remove Spotify/Slack + dead deps + dead config (P1 + P2). One
   cohesive deletion PR; `yarn tsc` + `yarn build` green.
2. **PR B** — Align CI Node to 22 (P3).
3. **PR C** — React 17 → 18 (`createRoot`) (P4).
4. _(let Dependabot auto-merge run; manually merge the major-version PRs)_ (P5).
5. **PR D** — CRA → Vite (P6), then add Vitest + Executor tests (P7).
6. **PR E** — Opportunistic Terminal cleanups (P8), foldable into PR A or D.

Do **not** run `./deploy` during this work — it's destructive
(`rm -rf src public …`, force-push to `production`).
