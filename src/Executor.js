//@flow

class Executor {
  setContents: (Array<any>) => void

  constructor(setContents: (Array<any>) => void) {
    this.setContents = setContents
  }

  run(command: string): ?string {
    const cleaned = command.trim()

    switch(cleaned) {
      case 'clear':
        this.setContents([])
        return null
    }
    return `execution of '${command}'`
  }
}

export default Executor
