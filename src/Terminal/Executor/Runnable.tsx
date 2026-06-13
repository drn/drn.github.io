import { type ReactNode } from 'react'

export interface Runnable {
  run(arg0: Array<string>): {
    success: boolean
    builtins?: Array<string>
    result?: ReactNode
  }
}
