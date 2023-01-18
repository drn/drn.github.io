import React, { useState, useEffect, KeyboardEvent } from 'react'
import _ from 'lodash'
import './Input.css'
import Row from './Row'
import Executor from './Executor'

type Props = {
  code: string
  state: string
}

const Input = (props: Props) => {
  const [contents, setContents] = useState<any[]>([])
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)
  const executor = new Executor(setContents)
  const initialInputValue =
    !!props.code && props.state === 'spotify' ? `spotify ${props.code}` : ''

  useEffect(() => {
    focus()
    document.body.addEventListener('click', focus)
    return () => {
      document.body.removeEventListener('click', focus)
    }
  })

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  }, [contents])

  const parseRow = (content: any, index: number) => {
    return <Row content={content} key={index} />
  }

  const contentRows = () => {
    const rows = _.map(contents, parseRow)
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
        spellCheck={false}
        onKeyPress={onKeyPress}
        onKeyDown={onKeyDown}
        defaultValue={initialInputValue}
        ref={(ref) => setInputRef(ref)}
      />
    )
  }

  const focus = () => {
    if (inputRef) inputRef.focus()
  }

  const run = (command: any) => {
    const response = executor.run(command)
    if (response && !response.halt) {
      setContents([
        ...contents,
        { type: 'command', body: command, success: response.success },
        { type: 'result', body: response.result },
      ])
    }
  }

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
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
