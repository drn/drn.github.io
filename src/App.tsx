import React from 'react'
// @ts-ignore
import HttpsRedirect from 'react-https-redirect'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Terminal from './Terminal'
import Slack from './Slack'

type Props = {}

const App = (props: Props) => {
  return (
    <HttpsRedirect>
      <Router>
        <Route path="/">
          <Switch>
            <Route path="/slack/callback" exact={true} component={Slack} />
            <Route path="/" component={Terminal} />
          </Switch>
        </Route>
      </Router>
    </HttpsRedirect>
  )
}

export default App
