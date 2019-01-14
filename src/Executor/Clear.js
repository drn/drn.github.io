//@flow

import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

class Clear implements Runnable, Nameable {
  name = 'clear'

  run(
    args: Array<string>
  ): { success: boolean, builtins?: Array<string>, result?: string } {
    return {
      success: true,
      builtins: ['clear'],
    }
  }
}

export default Clear
