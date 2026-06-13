import React, { type ReactNode } from 'react'
import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

class Cat implements Runnable, Nameable {
  name = 'cat'

  run(args: Array<string>): {
    success: boolean
    builtins?: Array<string>
    result?: ReactNode
  } {
    const filename = args[0] || ''
    let result: ReactNode = `cat: ${filename}: No such file or directory`
    switch (filename) {
      case 'README':
        result = <div>Welcome! More to come soon...</div>
        break
      default:
        break
    }
    return {
      success: true,
      result: result,
    }
  }
}

export default Cat
