import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

// TODO: Dynamically build list of available commands
class Help implements Runnable, Nameable {
  name = 'help'

  run(_: Array<string>): {
    success: boolean
    builtins?: Array<string>
    result?: string
  } {
    return {
      success: true,
      result: [
        'Available Commands:',
        '  cat',
        '  clear',
        '  ls',
        '  help',
        '  whoami',
      ].join('\r\n'),
    }
  }
}

export default Help
