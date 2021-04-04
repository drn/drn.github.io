import React from 'react'
import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

// TODO: Dynamically build list of available commands
class Help implements Runnable, Nameable {
  name = 'help'

  run(
    _: Array<string>
  ): { success: boolean; builtins?: Array<string>; result?: any } {
    return {
      success: true,
      result: (
        <div>
          Available Commands:
          <ul>
            <li>cat</li>
            <li>clear</li>
            <li>ls</li>
            <li>help</li>
            <li>whoami</li>
          </ul>
        </div>
      ),
    }
  }
}

export default Help
