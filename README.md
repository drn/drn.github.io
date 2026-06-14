## [Home Terminal](https://console.drn.dev/)

[![CircleCI](https://circleci.com/gh/drn/drn.github.io.svg?style=svg)](https://circleci.com/gh/drn/drn.github.io)

A personal homepage rendered as an interactive terminal emulator, live at
[console.drn.dev](https://console.drn.dev/). Built with Vite, React 18, and
TypeScript, with the terminal itself powered by [xterm.js](https://xtermjs.org/).

---

### Commands

Run the dev server:

    yarn start

Run tests:

    yarn test

Typecheck (what CI runs):

    yarn tsc

Build:

    yarn build

Deploy:

    yarn deploy

### Adding a terminal command

Create a class in `src/Terminal/Executor/` implementing the `Runnable` and
`Nameable` interfaces, then register it in the `commands` array in
`src/Terminal/Executor/index.tsx`. A command's `run()` returns an ANSI string
as its `result` (use the helpers in `src/Terminal/ansi.ts` for color, Nerd Font
glyphs, and clickable links; separate lines with `\r\n`).

### License

This project is licensed under the [MIT License](LICENSE.md)
