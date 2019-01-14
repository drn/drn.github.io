//@flow

import React from 'react'
import { Runnable } from './Runnable'
import { Nameable } from './Nameable'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

class Whoami implements Runnable, Nameable {
  name = 'whoami'

  run(
    args: Array<string>
  ): { success: boolean, builtins?: Array<string>, result?: any } {
    return {
      success: true,
      result: (
        <div>
          <div>Darren Cheng</div>
          <div>Co-Founder @ Thanx</div>
          <div>
            <a href={'https://github.com/drn'} target={'_blank'}>
              drn @ <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
        </div>
      ),
    }
  }
}

export default Whoami
