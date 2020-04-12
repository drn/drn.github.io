import React from 'react'
import { Runnable } from './Runnable'
import { Nameable } from './Nameable'
import copy from 'copy-to-clipboard'

class Spotify implements Runnable, Nameable {
  name = 'spotify'

  run(
    args: Array<string>
  ): { success: boolean; builtins?: Array<string>; result?: any } {
    copy(args[0])
    return {
      success: true,
      result: (
        <div>
          To continue authenticating spotify, paste the contents of your
          clipboard back into your terminal.
        </div>
      ),
    }
  }
}

export default Spotify
