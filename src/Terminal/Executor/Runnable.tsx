export interface Runnable {
  run(args: Array<string>): {
    success: boolean
    builtins?: Array<string>
    result?: string
  }
}
