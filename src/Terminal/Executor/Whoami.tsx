import React from 'react'
import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'

class Whoami implements Runnable, Nameable {
  name = 'whoami'

  run(_: Array<string>): {
    success: boolean
    builtins?: Array<string>
    result?: any
  } {
    return {
      success: true,
      result: (
        <div>
          <div>Darren Cheng</div>
          <div>
            CTO & Co-Founder @&nbsp;
            <a
              href={'https://www.thanx.com'}
              target={'_blank'}
              rel="noopener noreferrer"
            >
              Thanx
            </a>
          </div>
          <div>
            <a
              href={'https://github.com/drn'}
              target={'_blank'}
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faGithub} /> - drn
            </a>
          </div>
          <div>
            <a
              href={'https://www.linkedin.com/in/darrenlincheng'}
              target={'_blank'}
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faLinkedin} /> - darrenlincheng
            </a>
          </div>
        </div>
      ),
    }
  }
}

export default Whoami
