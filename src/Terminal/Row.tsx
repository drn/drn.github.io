import React from 'react'
import Anime from 'react-anime'

type Props = {
  content: any
}

const Row = (props: Props) => {
  const body = () => {
    const body = props.content.body
    if (props.content.type === 'command') {
      const status = props.content.success ? 'success' : 'failure'
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

  return <div className="row">{body()}</div>
}

const memoized = React.memo(Row)

export default memoized
