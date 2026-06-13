import React, { type ReactNode } from 'react'
import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

class List implements Runnable, Nameable {
  name = 'ls'

  run(_: Array<string>): {
    success: boolean
    builtins?: Array<string>
    result?: ReactNode
  } {
    return {
      success: true,
      result: <div>README</div>,
    }
  }
}

export default List
