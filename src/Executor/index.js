//@flow

import { Runnable } from './Runnable'
import Clear from './Clear'
import _ from 'lodash'

class Executor {
  setContents: (Array<any>) => void
  commands: { [s: string]: Runnable }

  constructor(setContents: (Array<any>) => void) {
    this.setContents = setContents
    this.commands = {}
    const self: any = this
    self.register = this.register.bind(this)
    _.each([Clear], this.register)
  }

  // class implementing the Runnable and Nameable interfaces
  register(command: any) {
    let registered = new command()
    this.commands[registered.name] = registered
  }

  run(command: string): ?string {
    const cleaned = command.trim()

    // separate command from arguments
    let runner = this.commands[cleaned]
    if (runner) {
      let results = runner.run([])

      if (results.builtins) {
        _.each(results.builtins, builtin => {
          this.builtin(builtin)
        })
      }

      return results.result
    }

    return `zsh: command not found: ${command}`
  }

  // Built In Commands

  builtin(command: string) {
    switch (command) {
      case 'clear':
        this.clear()
        break
      default:
        break
    }
  }

  clear() {
    this.setContents([])
  }
}

export default Executor
