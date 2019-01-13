import React, { Component } from 'react';
import Anime from 'react-anime';
import './Input.css';

class Input extends Component {
  indicator() {
    return <span className="indicator">❯</span>;
  }

  render() {
    return (
      <div className="input">
        <Anime duration={1000} opacity={[0, 1]} easing="linear">
          <div>{this.indicator()} echo 'Welcome'</div>
        </Anime>
        <Anime delay={750} duration={250} opacity={[0, 1]} easing="linear">
          <div>Welcome</div>
        </Anime>
      </div>
    );
  }
}

export default Input;
