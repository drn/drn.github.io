import React, { useState, useEffect } from 'react'
import moment from 'moment'
import './Header.css'
import useWindowDimensions from '../hooks/useWindowDimensions'

// &#x2B80; | 11136 - solid right
// &#x2B81; | 11137 - empty right
// &#x2B82; | 11138 - solid left
// &#x2B83; | 11139 - empty left

const Header = () => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const { width } = useWindowDimensions()

  useEffect(() => {
    const updateHeader = () => {
      setDate(formatDate())
      setTime(formatTime())
    }
    updateHeader()
    const timer = setInterval(updateHeader, 500)
    return () => clearInterval(timer)
  }, [])

  const cpu = () => {
    return '3%c'
  }

  const mem = () => {
    return '13%m'
  }

  const bat = () => {
    return '100%b'
  }

  const formatDate: () => string = () => {
    return (
      moment().format('ddd D ') +
      String.fromCharCode(11139) +
      moment().format('MMM YYYY')
    )
  }

  const formatTime: () => string = () => {
    return moment().format('h:mm:ssa')
  }

  const left =
    width < 800 ? (
      <div className="left">
        <span className="color1">&nbsp;master &#x2B81; *&nbsp;</span>
        <span className="color1_3">⮀</span>
      </div>
    ) : width < 1200 ? (
      <div className="left">
        <span className="color1">&nbsp;master &#x2B81; *&nbsp;</span>
        <span className="color1_3">&#x2B80;</span>
        <span className="color3"> 192.168.1.1 </span>
      </div>
    ) : (
      <div className="left">
        <span className="color1">&nbsp;master &#x2B81; *&nbsp;</span>
        <span className="color1_2">&#x2B80;</span>
        <span className="color2">&nbsp;Thanx&nbsp;</span>
        <span className="color2_3">&#x2B80;</span>
        <span className="color3"> 192.168.1.1 </span>
      </div>
    )

  const center = (
    <div className="center">
      <span className="color3_1">&#x2B80;</span>
      <span className="color1">&nbsp;1 core&nbsp;</span>
      <span className="color1_3">&#x2B80;</span>
    </div>
  )

  const right =
    width < 800 ? (
      <div className="right">
        <span className="color3_1">&#x2B80;</span>
        <span className="color1">&nbsp;{time}&nbsp;</span>
      </div>
    ) : width < 1200 ? (
      <div className="right">
        <span className="color3">
          &nbsp;{cpu()} {mem()} {bat()}&nbsp;
        </span>
        <span className="color3_1">&#x2B80;</span>
        <span className="color1">&nbsp;{time}&nbsp;</span>
      </div>
    ) : (
      <div className="right">
        <span className="color3">
          &nbsp;{cpu()} {mem()} {bat()}&nbsp;
        </span>
        <span className="color3_2">&#x2B80;</span>
        <span className="color2">&nbsp;{date}&nbsp;</span>
        <span className="color2_1">&#x2B80;</span>
        <span className="color1">&nbsp;{time}&nbsp;</span>
      </div>
    )

  return (
    <div className="header">
      {left}
      {center}
      {right}
    </div>
  )
}

export default Header
