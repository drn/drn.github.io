//@flow

import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import './Input.css'
import Row from './Row'
import Executor from './Executor'

const Input = () => {
  const [contents, setContents] = useState([])
  const [inputRef, setInputRef] = useState(null)
  const executor = new Executor(setContents)

  useEffect(() => {
    focus()
    // $FlowIgnore
    document.body.addEventListener('click', focus)
    return () => {
      // $FlowIgnore
      document.body.removeEventListener('click', focus)
    }
  })

  useEffect(
    () => {
      // $FlowIgnore
      window.scrollTo(0, document.body.scrollHeight)
    },
    [contents]
  )

  const parseRow = (content: any, index: number) => {
    return <Row content={content} key={index} />
  }

  const contentRows = () => {
    let rows = _.map(contents, parseRow)
    return <div>{rows}</div>
  }

  const input = () => {
    return (
      <input
        type="text"
        className="input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onKeyPress={onKeyPress}
        onKeyDown={onKeyDown}
        ref={ref => setInputRef(ref)}
      />
    )
  }

  const focus = () => {
    if (inputRef) inputRef.focus()
  }

  const run = (command: any) => {
    let response = executor.run(command)
    if (response && !response.halt) {
      setContents([
        ...contents,
        { type: 'command', body: command, success: response.success },
        { type: 'result', body: response.result },
      ])
    }
  }

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (inputRef) run(inputRef.value)
      if (inputRef) inputRef.value = ''
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
    }
  }

  return (
    <div className="input">
      <div className="row">&nbsp;</div>
      {contentRows()}
      <div className="row">
        <span className="indicator">❯</span>&nbsp;{input()}
      </div>
    </div>
  )
}

export default Input
