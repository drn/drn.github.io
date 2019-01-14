//@flow

import React from 'react'
import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

class Whoami implements Runnable, Nameable {
  name = 'whoami'

  run(
    args: Array<string>
  ): { success: boolean, builtins?: Array<string>, result?: any } {
    return {
      success: true,
      result: (
        <div>
          <div>Darren Cheng</div>
          <div>Co-Founder @ Thanx</div>
        </div>
      ),
    }
  }
}

export default Whoami
