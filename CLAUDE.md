# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A personal homepage rendered as an interactive terminal emulator. Built with Create React App (react-scripts 5), React 17, and TypeScript in strict mode. Served at `console.drn.dev` (see `CNAME`) / `drn.github.io`.

## Commands

```bash
yarn start          # dev server (react-scripts start)
yarn build          # production build into build/
yarn tsc            # typecheck (noEmit) — this is what CI runs as "test"
yarn deploy         # build + publish (see Deploy below)
```

There is **no jest test suite** (no `*.spec`/`*.test` files exist). `yarn test` exists but the CI "test" job runs `yarn tsc` for typechecking instead. ESLint is configured (`.eslintrc.cjs`) but there is no `lint` script; formatting is enforced by Prettier via a Husky pre-commit hook (`pretty-quick --staged`).

Node: `.tool-versions` pins 22.15.0 locally; CI (`.circleci/config.yml`) pins 16.14.2.

## Architecture

The app is a single-page React Router app (`src/App.tsx`); the main route `/` renders the `Terminal` — the interactive shell UI.

### Terminal command system

The terminal (`src/Terminal/`) reads a line of input (`Input.tsx`), passes it to an `Executor` (`src/Terminal/Executor/index.tsx`), and renders the result as a new `Row`. This is the core extension point.

`Executor` constructs each registered command, keying it by its `name`, then on each run parses input into `{ command, arguments }` (split on spaces) and dispatches to the matching command. Unknown commands return `zsh: command not found: …`.

Commands implement two interfaces (`Runnable`, `Nameable`):

- `name: string` — the command word typed in the terminal
- `run(args: string[])` → `{ success, result?, builtins? }` where `result` can be a React node

**To add a command:** create a class in `src/Terminal/Executor/` implementing `Runnable, Nameable`, then add it to the `commands` array in `src/Terminal/Executor/index.tsx`. Existing examples: `Cat`, `Clear`, `Help`, `List` (`ls`), `Whoami`.

**Built-in side effects:** a command can return `builtins: ['clear']` to trigger a side effect handled by `Executor.builtin()` (which can call `setContents` to manipulate terminal state). When a command returns builtins, the run `halt`s and no command/result rows are appended.

## Deploy

`yarn deploy` runs `./deploy`, which: aborts on a dirty tree, builds, **destructively replaces the working tree with `build/` contents** (`rm -rf public src yarn.lock README.md deploy`), commits, force-pushes to `upstream HEAD:production`, then `git reset --hard HEAD^` to restore source. The CircleCI `deploy` job only triggers on the `production` branch. Be careful editing `deploy` — it deletes source files in the working copy as a normal part of operation.

## Conventions

Prettier (`.prettierrc`): no semicolons, single quotes, trailing commas everywhere, 80-col width. TypeScript `strict` is on. `lodash` is used throughout (imported as `_`).
