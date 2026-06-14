import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

class Cat implements Runnable, Nameable {
  name = 'cat'

  run(args: Array<string>): {
    success: boolean
    builtins?: Array<string>
    result?: string
  } {
    const filename = args[0] || ''
    let result = `cat: ${filename}: No such file or directory`
    switch (filename) {
      case 'README':
        result = 'Welcome! More to come soon...'
        break
      default:
        break
    }
    return {
      success: true,
      result: result,
    }
  }
}

export default Cat
