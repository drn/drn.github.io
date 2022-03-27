import React from 'react'
// @ts-ignore
import HttpsRedirect from 'react-https-redirect'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Terminal from './Terminal'
import Slack from './Slack'

const App = () => {
  return (
    <HttpsRedirect>
      <Router>
        <Routes>
          <Route path="/slack/callback" element={<Slack />} />
          <Route path="/" element={<Terminal />} />
        </Routes>
      </Router>
    </HttpsRedirect>
  )
}

export default App
