//@flow

import { Runnable } from './Runnable'
import Clear from './Clear'
import Whoami from './Whoami'
import _ from 'lodash'

const commands = [Clear, Whoami]

class Executor {
  setContents: (Array<any>) => void
  registered: { [s: string]: Runnable }

  constructor(setContents: (Array<any>) => void) {
    this.setContents = setContents
    this.registered = {}
    const self: any = this
    self.register = this.register.bind(this)
    _.each(commands, this.register)
  }

  // class implementing the Runnable and Nameable interfaces
  register(command: any) {
    let initialized = new command()
    this.registered[initialized.name] = initialized
  }

  run(command: string): ?string {
    const cleaned = command.trim()

    // separate command from arguments
    let runner = this.registered[cleaned]
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
