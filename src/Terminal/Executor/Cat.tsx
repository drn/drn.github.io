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
    if (filename === 'README') {
      return {
        success: true,
        result: 'Welcome! More to come soon...',
      }
    }
    return {
      success: false,
      result: `cat: ${filename}: No such file or directory`,
    }
  }
}

export default Cat
