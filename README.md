## [Home Terminal](https://console.drn.dev/)

[![CircleCI](https://circleci.com/gh/drn/drn.github.io.svg?style=svg)](https://circleci.com/gh/drn/drn.github.io)

A personal homepage rendered as an interactive terminal emulator, live at
[console.drn.dev](https://console.drn.dev/). Built with Create React App,
React 17, and TypeScript.

---

### Commands

Run the dev server:

    yarn start

Typecheck (what CI runs):

    yarn tsc

Build:

    yarn build

Deploy:

    yarn deploy

### Adding a terminal command

Create a class in `src/Terminal/Executor/` implementing the `Runnable` and
`Nameable` interfaces, then register it in the `commands` array in
`src/Terminal/Executor/index.tsx`.

### License

This project is licensed under the [MIT License](LICENSE.md)
