import React from 'react'
import PropTypes from 'prop-types'
import ReactTwilioVideo, { twilioVideo } from 'react-twilio-video'

const ROOM_NAME = 'general'

class VideoSession extends React.Component {
  state = {
    isRoomConnected: false
  }
  room = null
  async componentDidMount() {
    try {
      this.room = await twilioVideo.connect(
        this.props.match.params.token,
        {
          preferredVideoCodecs: ['H264', 'VP8'],
          name: ROOM_NAME,
          audio: true,
          video: false
        }
      )
      this.setState({ isRoomConnected: true })
    } catch (error) {
      console.error(error)
    }
  }
  render() {
    const { isRoomConnected } = this.state
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        {isRoomConnected && <ReactTwilioVideo room={this.room} />}
      </div>
    )
  }
}

VideoSession.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default VideoSession
