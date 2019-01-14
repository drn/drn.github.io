import React, { Component } from 'react';
import _ from 'lodash';
import './Input.css';

class Input extends Component {
  constructor(props) {
    super(props);

    this.focus = this.focus.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.parseRow = this.parseRow.bind(this);

    this.state = {
      contents: []
    };
  }

  componentDidMount() {
    this.focus();
    document.body.addEventListener('click', this.focus);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.focus);
  }

  parseRow(content, index) {
    let body = content.body;
    if (content.type === 'command') {
      body = <div>{this.indicator()}&nbsp;{body}</div>;
    }
    return (
      <div className="row" key={index}>
        {body}
      </div>
    );
  }

  contentRows() {
    let rows = _.map(this.state.contents, this.parseRow);
    return <div>{rows}</div>;
  }

  indicator() {
    return <span className="indicator">❯</span>;
  }

  input() {
    return <input
      type="text"
      className="input"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      onKeyPress={this.onKeyPress}
      ref={(input) => { this.inputRef = input; }}
    />;
  }

  focus() {
    this.inputRef.focus();
  }

  run(command) {
    this.setState({
      contents: [
        ...this.state.contents,
        { type: 'command', body: command },
        { type: 'result', body: `execution of '${command}'` }
      ]
    });
  }

  onKeyPress(e) {
    if (e.key === 'Enter') {
      this.run(e.target.value);
      this.inputRef.value = '';
    }
  }

  render() {
    return (
      <div className="input">
        {this.contentRows()}
        <div className="row">
          {this.indicator()}&nbsp;{this.input()}
        </div>
      </div>
    );
  }
}

export default Input;
