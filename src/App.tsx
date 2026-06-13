import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Terminal from './Terminal'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Terminal />} />
      </Routes>
    </Router>
  )
}

export default App
