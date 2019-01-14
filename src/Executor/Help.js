//@flow

import React from 'react'
import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

class Help implements Runnable, Nameable {
  name = 'help'

  run(
    args: Array<string>
  ): { success: boolean, builtins?: Array<string>, result?: any } {
    return {
      success: true,
      result: (
        <div>
          Available Commands:
          <ul>
            <li>help</li>
            <li>clear</li>
            <li>whoami</li>
          </ul>
        </div>
      ),
    }
  }
}

export default Help
