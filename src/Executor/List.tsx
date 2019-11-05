import React from 'react'
import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

class List implements Runnable, Nameable {
  name = 'ls'

  run(
    args: Array<string>
  ): { success: boolean; builtins?: Array<string>; result?: any } {
    return {
      success: true,
      result: <div>README</div>,
    }
  }
}

export default List
