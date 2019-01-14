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
    this.setState({ contents: contents }, () => {
      // $FlowIgnore
      window.scrollTo(0, document.body.scrollHeight)
    })
  }

  parseRow(content: any, index: number) {
    let body = content.body
    if (content.type === 'command') {
      const status = content.success ? 'success' : 'failure'
      body = (
        <div>
          {this.indicator()}&nbsp;<span className={status}>{body}</span>
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
    let response = this.executor.run(command)
    if (response) {
      this.setContents([
        ...this.state.contents,
        { type: 'command', body: command, success: response.success },
        { type: 'result', body: response.result },
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
        <div className="row">&nbsp;</div>
        {this.contentRows()}
        <div className="row">
          {this.indicator()}&nbsp;{this.input()}
        </div>
      </div>
    )
  }
}

export default Input
