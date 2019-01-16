import React from 'react'
import PropTypes from 'prop-types'
import ReactTwilioVideo from 'react-twilio-video'

const ROOM_NAME = 'general'

class VideoSession extends React.Component {
  state = {
    token: null
  }
  async componentDidMount() {
    const { match } = this.props
    try {
      const res = await fetch(
        `${process.env.REACT_APP_DEMO_SERVER_URL}/token/${match.params.identity}`
      )
      const { token } = await res.json()
      this.setState({ token })
    } catch (error) {
      console.error(error)
    }
  }
  render() {
    const { token } = this.state
    if (!token) {
      return null
    }
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactTwilioVideo token={token} connectSettings={{ name: ROOM_NAME }} />
      </div>
    )
  }
}

VideoSession.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      identity: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default VideoSession
