//@flow

import React, { Component } from 'react'
import Anime from 'react-anime'

type Props = {
  content: any,
}

export default class Row extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return false
  }

  body(): any {
    let body = this.props.content.body
    if (this.props.content.type === 'command') {
      const status = this.props.content.success ? 'success' : 'failure'
      return (
        <div>
          <span className="indicator">❯</span>&nbsp;
          <span className={status}>{body}</span>
        </div>
      )
    }

    return (
      <Anime easing={'easeInSine'} color={['#DDD', '#BCBBBB']} duration={400}>
        <div>{body}</div>
      </Anime>
    )
  }

  render() {
    return <div className="row">{this.body()}</div>
  }
}
