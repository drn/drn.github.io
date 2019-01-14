//@flow

import React, { Component } from 'react'
import Header from './Header'
import Input from './Input'

// TODO http://tobiasahlin.com/moving-letters/#1

type Props = {}

class Terminal extends Component<Props> {
  render() {
    return (
      <div className="terminal">
        <Header />
        <Input />
      </div>
    )
  }
}

export default Terminal
