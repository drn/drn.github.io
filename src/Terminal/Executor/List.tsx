import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

class List implements Runnable, Nameable {
  name = 'ls'

  run(_: Array<string>): {
    success: boolean
    builtins?: Array<string>
    result?: string
  } {
    return {
      success: true,
      result: 'README',
    }
  }
}

export default List
