//@flow

export interface Runnable {
  run(
    Array<string>
  ): { success: boolean, builtins?: Array<string>, result?: string };
}
