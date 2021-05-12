import React, { useState, useEffect } from 'react'
import moment from 'moment'
import './Header.css'
import useWindowDimensions from '../hooks/useWindowDimensions'

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
    return moment().format('ddd D ⮃ MMM YYYY')
  }

  const formatTime: () => string = () => {
    return moment().format('h:mm:ssa')
  }

  const left =
    width < 800 ? (
      <div className="left">
        <span className="color1">&nbsp;master ⮁ *&nbsp;</span>
        <span className="color1_3">⮀</span>
      </div>
    ) : width < 1200 ? (
      <div className="left">
        <span className="color1">&nbsp;master ⮁ *&nbsp;</span>
        <span className="color1_3">⮀</span>
        <span className="color3"> 192.168.1.1 </span>
      </div>
    ) : (
      <div className="left">
        <span className="color1">&nbsp;master ⮁ *&nbsp;</span>
        <span className="color1_2">⮀</span>
        <span className="color2">&nbsp;Thanx&nbsp;</span>
        <span className="color2_3">⮀</span>
        <span className="color3"> 192.168.1.1 </span>
      </div>
    )

  const center = (
    <div className="center">
      <span className="color3_1">⮀</span>
      <span className="color1">&nbsp;1 core&nbsp;</span>
      <span className="color1_3">⮀</span>
    </div>
  )

  const right =
    width < 800 ? (
      <div className="right">
        <span className="color3_1">⮀</span>
        <span className="color1">&nbsp;{time}&nbsp;</span>
      </div>
    ) : width < 1200 ? (
      <div className="right">
        <span className="color3">
          &nbsp;{cpu()} {mem()} {bat()}&nbsp;
        </span>
        <span className="color3_1">⮀</span>
        <span className="color1">&nbsp;{time}&nbsp;</span>
      </div>
    ) : (
      <div className="right">
        <span className="color3">
          &nbsp;{cpu()} {mem()} {bat()}&nbsp;
        </span>
        <span className="color3_2">⮀</span>
        <span className="color2">&nbsp;{date}&nbsp;</span>
        <span className="color2_1">⮀</span>
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
