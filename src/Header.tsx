import React, { useState, useEffect } from 'react'
import moment from 'moment'
import './Header.css'

type PropsT = {}

const Header = (props: PropsT) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(formatDate())
      setTime(formatTime())
    }, 500)
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

  return (
    <div className="header">
      <div className="left">
        <span className="color1">&nbsp;master ⮁ *&nbsp;</span>
        <span className="color1_2">⮀</span>
        <span className="color2">&nbsp;Thanx&nbsp;</span>
        <span className="color2_3">⮀</span>
        <span className="color3"> 192.168.1.1 </span>
      </div>

      <div className="center">
        <span className="color3_1">⮀</span>
        <span className="color1">&nbsp;1 terminal&nbsp;</span>
        <span className="color1_3">⮀</span>
        <span className="color3_2">⮀</span>
        <span className="color2">&nbsp;2 reference&nbsp;</span>
        <span className="color2_3">⮀</span>
      </div>

      <div className="right">
        <span className="color3">
          &nbsp;{cpu()} {mem()} {bat()}&nbsp;
        </span>
        <span className="color3_2">⮀</span>
        <span className="color2">&nbsp;{date}&nbsp;</span>
        <span className="color2_1">⮀</span>
        <span className="color1">&nbsp;{time}&nbsp;</span>
      </div>
    </div>
  )
}

export default Header
