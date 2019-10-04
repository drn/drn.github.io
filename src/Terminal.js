//@flow

import React from 'react'
import HttpsRedirect from 'react-https-redirect'
import Header from './Header'
import Input from './Input'

// TODO http://tobiasahlin.com/moving-letters/#1

type PropsT = {}

const Terminal = (props: PropsT) => {
  return (
    <HttpsRedirect>
      <div className="terminal">
        <Header />
        <Input />
      </div>
    </HttpsRedirect>
  )
}

export default Terminal
