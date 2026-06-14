import { Runnable } from './Runnable'
import { Nameable } from './Nameable'
import { LINK, GITHUB, LINKEDIN, paint } from '../ansi'

class Whoami implements Runnable, Nameable {
  name = 'whoami'

  run(_: Array<string>): {
    success: boolean
    builtins?: Array<string>
    result?: string
  } {
    return {
      success: true,
      result: [
        'Darren Cheng',
        `CTO & Co-Founder @ Thanx (${paint('https://www.thanx.com', LINK)})`,
        `${GITHUB} drn (${paint('https://github.com/drn', LINK)})`,
        `${LINKEDIN} darrenlincheng (${paint(
          'https://www.linkedin.com/in/darrenlincheng',
          LINK,
        )})`,
      ].join('\r\n'),
    }
  }
}

export default Whoami
