import React from 'react'
// @ts-ignore
import Header from './Header'
import Input from './Input'
import QueryString from 'query-string'
import { useParams } from 'react-router-dom'

const Terminal = () => {
  const params = useParams()
  const code = params.code ?? ''
  const state = params.state ?? ''

  return (
    <div className="terminal">
      <Header />
      <Input code={code} state={state} />
    </div>
  )
}

export default Terminal
