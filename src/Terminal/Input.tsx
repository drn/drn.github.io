import React, { useState, useEffect, useMemo, KeyboardEvent } from 'react'
import _ from 'lodash'
import './Input.css'
import Row from './Row'
import Executor from './Executor'

const Input = () => {
  const [contents, setContents] = useState<any[]>([])
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)
  const executor = useMemo(() => new Executor(setContents), [])

  useEffect(() => {
    focus()
    document.body.addEventListener('click', focus)
    return () => {
      document.body.removeEventListener('click', focus)
    }
  }, [inputRef])

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
        onKeyDown={onKeyDown}
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
      setContents((prev) => [
        ...prev,
        { type: 'command', body: command, success: response.success },
        { type: 'result', body: response.result },
      ])
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
    }
    // ignore Enter while an IME composition session is still in progress
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      if (inputRef) run(inputRef.value)
      if (inputRef) inputRef.value = ''
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
