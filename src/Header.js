import React, { Component } from 'react';
import moment from 'moment';
import './Header.css';

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      date: this.date(),
      time: this.time()
    };
  }

  componentDidMount() {
    this.timer = setInterval(() => this.tickClock(), 500);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  cpu() { return '3%c'; }

  mem() { return '47%m'; }

  bat() { return '19%b'; }

  date() { return moment().format('ddd D ⮃ MMM YYYY'); }

  time() { return moment().format('h:mm:ssa'); }

  tickClock() {
    this.setState({
      date: this.date(),
      time: this.time()
    });
  }

  render() {
    return (
      <div className="header">
        <div className="left">
          <span className="color1">master ⮁ ✴&nbsp; </span>
          <span className="color1_2">⮀</span>
          <span className="color2"> Thanx&nbsp; </span>
          <span className="color2_3">⮀</span>
          <span className="color3">192.168.1.1</span>
        </div>

        <div className="center">
          <span className="color3_1">⮀</span>
          <span className="color1"> 1 terminal&nbsp; </span>
          <span className="color1_3">⮀</span>
          <span className="color3_2">⮀</span>
          <span className="color2"> 2 reference&nbsp; </span>
          <span className="color2_3">⮀</span>
        </div>

        <div className="right">
          <span className="color3">
            {this.cpu()} {this.mem()} {this.bat()}&nbsp;
          </span>
          <span className="color2_3">⮂</span>
          <span className="color2">{this.state.date}</span>
          <span className="color1_2">⮂</span>
          <span className="color1">{this.state.time}</span>
        </div>
      </div>
    );
  }
}

export default Header;
