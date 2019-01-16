import React from 'react'
import PropTypes from 'prop-types'
import ReactTwilioVideo from 'react-twilio-video'

const ROOM_NAME = 'general'

const VideoSession = ({ match }) => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <ReactTwilioVideo token={match.params.token} connectSettings={{ name: ROOM_NAME }} />
  </div>
)

VideoSession.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default VideoSession
