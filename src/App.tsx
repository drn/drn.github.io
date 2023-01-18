import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Terminal from './Terminal'
import Slack from './Slack'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/slack/callback" element={<Slack />} />
        <Route path="/" element={<Terminal />} />
      </Routes>
    </Router>
  )
}

export default App
