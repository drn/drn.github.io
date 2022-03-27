import React, { MouseEvent, useState } from 'react'
import { useParams } from 'react-router-dom'
import './index.css'
import * as QueryString from 'query-string'
import copy from 'copy-to-clipboard'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Anime from 'react-anime'

const Slack = () => {
  const params = useParams()
  const code = params.code ?? ''
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = (e: MouseEvent) => {
    if (!copied) {
      e.preventDefault()
      copy(code)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1000)
    }
  }

  const indicator = (): any => {
    if (!copied) return ''
    return (
      <div>
        <Anime
          easing={'easeInOutSine'}
          direction={'alternate'}
          opacity={[0, 1]}
          duration={400}
        >
          <p>copied...</p>
        </Anime>
      </div>
    )
  }

  return (
    <div className="flex-center">
      <div className="well">
        <p>Paste the following auth code into your terminal</p>
        <button onClick={handleCopy} className="code">
          <FontAwesomeIcon icon={faCopy} /> {code}
        </button>
        {indicator()}
      </div>
    </div>
  )
}

export default Slack
