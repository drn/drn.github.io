import React from 'react'
// @ts-ignore
import Header from './Header'
import Input from './Input'
import QueryString from 'query-string'
import { RouteComponentProps } from 'react-router-dom'

const Terminal = (props: RouteComponentProps) => {
  const query = QueryString.parse(props.location.search)
  const code = (query.code ?? '').toString()
  const state = (query.state ?? '').toString()

  return (
    <div className="terminal">
      <Header />
      <Input code={code} state={state} />
    </div>
  )
}

export default Terminal
