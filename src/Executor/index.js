//@flow

import _ from 'lodash'
import { Runnable } from './Runnable'
import Clear from './Clear'
import Help from './Help'
import Whoami from './Whoami'

const commands = [Clear, Help, Whoami]

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

  run(command: string): { halt?: boolean, success: boolean, result: ?string } {
    const cleaned = command.trim()

    // separate command from arguments
    let runner = this.registered[cleaned]
    if (runner) {
      let results = runner.run([])

      if (results.builtins && results.builtins.length > 0) {
        _.each(results.builtins, builtin => {
          this.builtin(builtin)
        })

        return {
          halt: true,
          success: true,
          result: results.result,
        }
      }

      return {
        success: true,
        result: results.result,
      }
    }

    return {
      success: false,
      result: `zsh: command not found: ${command}`,
    }
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
