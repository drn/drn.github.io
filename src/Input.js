import React, { Component } from 'react';
import Anime from 'react-anime';
import './Input.css';

class Input extends Component {
  constructor(props) {
    super(props);
    this.focus = this.focus.bind(this);
  }

  componentDidMount() {
    document.body.addEventListener('click', this.focus);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.focus);
  }

  indicator() {
    return <span className="indicator">❯</span>;
  }

  input() {
    return <input
      type="text"
      className="input"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      ref={(input) => { this.input = input; }}
    />;
  }

  focus() {
    this.input.focus();
  }

  render() {
    return (
      <div className="input">
        <Anime duration={1000} opacity={[0, 1]} easing="linear">
          <div className="row">{this.indicator()}&nbsp;echo 'Welcome'</div>
        </Anime>
        <Anime delay={750} duration={250} opacity={[0, 1]} easing="linear">
          <div>Welcome</div>
        </Anime>
        <div className="row">
          {this.indicator()}&nbsp;{this.input()}
        </div>
      </div>
    );
  }
}

export default Input;
