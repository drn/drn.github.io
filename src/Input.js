//@flow

import React, { Component } from 'react'
import _ from 'lodash'
import './Input.css'
import Executor from './Executor'

type Props = {}
type State = {
  contents: Array<any>,
}

class Input extends Component<Props, State> {
  focus: () => void
  onKeyPress: Event => void
  parseRow: (any, number) => void
  setContents: (Array<any>) => void
  inputRef: ?HTMLInputElement
  executor: Executor

  constructor(props: Props) {
    super(props)

    this.focus = this.focus.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
    this.parseRow = this.parseRow.bind(this)
    this.setContents = this.setContents.bind(this)
    this.executor = new Executor(this.setContents)

    this.state = {
      contents: [],
    }
  }

  componentDidMount() {
    this.focus()
    // $FlowIgnore
    document.body.addEventListener('click', this.focus)
  }

  componentWillUnmount() {
    // $FlowIgnore
    document.body.removeEventListener('click', this.focus)
  }

  setContents(contents: Array<any>) {
    this.setState({ contents: contents })
  }

  parseRow(content: any, index: number) {
    let body = content.body
    if (content.type === 'command') {
      body = (
        <div>
          {this.indicator()}&nbsp;{body}
        </div>
      )
    }
    return (
      <div className="row" key={index}>
        {body}
      </div>
    )
  }

  contentRows() {
    let rows = _.map(this.state.contents, this.parseRow)
    return <div>{rows}</div>
  }

  indicator() {
    return <span className="indicator">❯</span>
  }

  input() {
    return (
      <input
        type="text"
        className="input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onKeyPress={this.onKeyPress}
        ref={input => {
          this.inputRef = input
        }}
      />
    )
  }

  focus() {
    if (this.inputRef) this.inputRef.focus()
  }

  run(command: any) {
    let result = this.executor.run(command)
    if (result) {
      this.setContents([
        ...this.state.contents,
        { type: 'command', body: command },
        { type: 'result', body: result },
      ])
    }
  }

  onKeyPress(e: SyntheticKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (this.inputRef) this.run(this.inputRef.value)
      if (this.inputRef) this.inputRef.value = ''
    }
  }

  render() {
    return (
      <div className="input">
        {this.contentRows()}
        <div className="row">
          {this.indicator()}&nbsp;{this.input()}
        </div>
      </div>
    )
  }
}

export default Input
