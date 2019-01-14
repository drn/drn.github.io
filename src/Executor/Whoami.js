//@flow

import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

class Whoami implements Runnable, Nameable {
  name = 'whoami'

  run(
    args: Array<string>
  ): { success: boolean, builtins?: Array<string>, result?: string } {
    return {
      success: true,
      result: 'darrencheng'
    }
  }
}

export default Whoami
