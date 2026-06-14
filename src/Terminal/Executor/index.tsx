import _ from 'lodash'
import { Runnable } from './Runnable'
import { Nameable } from './Nameable'
import Cat from './Cat'
import Clear from './Clear'
import Help from './Help'
import List from './List'
import Whoami from './Whoami'

const commands: Array<new () => Runnable & Nameable> = [
  Cat,
  Clear,
  Help,
  List,
  Whoami,
]

class Executor {
  private clear: () => void
  registered: {
    [s: string]: Runnable & Nameable
  }

  constructor(clear: () => void) {
    this.clear = clear
    this.registered = {}
    this.register = this.register.bind(this)
    _.each(commands, this.register)
  }

  // class implementing the Runnable and Nameable interfaces
  register(command: new () => Runnable & Nameable) {
    const initialized = new command()
    this.registered[initialized.name] = initialized
  }

  run(input: string): {
    halt?: boolean
    success: boolean
    result: string | null
  } {
    const parsed = this.parse(input)

    // separate command from arguments
    const runner = this.registered[parsed.command]
    if (runner) {
      const results = runner.run(parsed.arguments)

      if (results.builtins && results.builtins.length > 0) {
        _.each(results.builtins, (builtin) => {
          this.builtin(builtin)
        })

        return {
          halt: true,
          success: true,
          result: results.result ?? null,
        }
      }

      return {
        success: results.success,
        result: results.result ?? null,
      }
    }

    return {
      success: false,
      result: `zsh: command not found: ${parsed.command}`,
    }
  }

  // Helpers

  // splits input string into command and arguments
  parse(input: string): { command: string; arguments: Array<string> } {
    const parts = input.trim().split(' ')
    const args = parts.slice(1, parts.length)
    return {
      command: parts[0] || '',
      arguments: args,
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
}

export default Executor
