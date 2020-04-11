import React from 'react'
// @ts-ignore
import Header from './Header'
import Input from './Input'

// TODO http://tobiasahlin.com/moving-letters/#1

type Props = {}

const Terminal = (props: Props) => {
  return (
    <div className="terminal">
      <Header />
      <Input />
    </div>
  )
}

export default Terminal
