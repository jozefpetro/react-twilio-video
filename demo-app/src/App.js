import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import VideoSession from './routes/VideoSession'

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/video-session/:token" component={VideoSession} />
        </Switch>
      </Router>
    )
  }
}

export default App
