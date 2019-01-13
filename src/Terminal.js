import React, { Component } from 'react';
import Header from './Header';
import Input from './Input';

// TODO http://tobiasahlin.com/moving-letters/#1

class Terminal extends Component {
  render() {
    return (
      <div className="terminal">
        <Header/>
        <Input/>
      </div>
    );
  }
}

export default Terminal;
