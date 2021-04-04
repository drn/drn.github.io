import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

class Clear implements Runnable, Nameable {
  name = 'clear'

  run(
    _: Array<string>
  ): { success: boolean; builtins?: Array<string>; result?: any } {
    return {
      success: true,
      builtins: ['clear'],
    }
  }
}

export default Clear
