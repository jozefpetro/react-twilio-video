import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { createLocalAudioTrack, createLocalVideoTrack } from 'twilio-video'
import Controls from './Controls'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

const RemoteVideo = styled.video`
  width: 100%;
  height: 100%;
`

const LocalVideo = styled.video`
  position: absolute;
  width: 20%;
  min-width: 150px;
  top: 20px;
  right: 20px;
  border-radius: 6px;
`

const PARTICIPANT_CONNECTED = 'participantConnected'
const PARTICIPANT_DISCONNECTED = 'participantDisconnected'
const TRACK_SUBSCRIBED = 'trackSubscribed'
const TRACK_UNSUBSCRIBED = 'trackUnsubscribed'

const AUDIO = 'audio'
const VIDEO = 'video'

const getMediaStreamTrack = track => track.mediaStreamTrack

class Video extends React.Component {
  state = {
    remoteVideoTracks: {},
    remoteAudioTracks: {},
    localVideoTrack: null,
    localVideoTrack: null
  }
  room = null
  async componentDidMount() {
    const { room } = this.props
    this.room = room
    this.room.participants.forEach(participant => {
      this.handleParticipantConnected(participant)
    })
    this.room.on(PARTICIPANT_CONNECTED, this.handleParticipantConnected)
    this.room.on(PARTICIPANT_DISCONNECTED, this.handleParticipantDisconnected)
    const localAudioTrack = this.room.localParticipant.audioTracks.values().next().value
    if (localAudioTrack) {
      this.publishLocalTrack(localAudioTrack)
    }
  }
  componentWillUnmount() {
    const { localVideoTrack, localAudioTrack } = this.state
    if (!this.room) return
    if (localVideoTrack) this.unpublishLocalTrack(localVideoTrack)
    if (localAudioTrack) this.unpublishLocalTrack(localAudioTrack)
    this.room.disconnect()
  }
  handleParticipantConnected = participant => {
    participant.on(TRACK_SUBSCRIBED, this.handleRemoteTrackCreate)
    participant.on(TRACK_UNSUBSCRIBED, this.handleRemoteTrackRemove)
  }
  handleParticipantDisconnected = participant => {
    participant.removeListener(TRACK_SUBSCRIBED, this.handleRemoteTrackCreate)
    participant.removeListener(TRACK_UNSUBSCRIBED, this.handleRemoteTrackRemove)
  }
  handleRemoteTrackCreate = remoteTrack => {
    console.log(remoteTrack)
    if (remoteTrack.kind === VIDEO) {
      this.setState(({ remoteVideoTracks }) => ({
        remoteVideoTracks: { ...remoteVideoTracks, [remoteTrack.name]: remoteTrack }
      }))
    } else if (remoteTrack.kind === AUDIO) {
      this.setState(({ remoteAudioTracks }) => ({
        remoteAudioTracks: { ...remoteAudioTracks, [remoteTrack.name]: remoteTrack }
      }))
    }
  }
  handleRemoteTrackRemove = remoteTrack => {
    if (remoteTrack.kind === VIDEO) {
      this.setState(
        ({ remoteVideoTracks: { [remoteTrack.name]: deletedTrack, ...restTracks } }) => ({
          remoteVideoTracks: restTracks
        })
      )
    } else if (remoteTrack.kind === AUDIO) {
      this.setState(
        ({ remoteAudioTracks: { [remoteTrack.name]: deletedTrack, ...restTracks } }) => ({
          remoteAudioTracks: restTracks
        })
      )
    }
  }
  unpublishLocalTrack = localTrack => {
    localTrack.stop()
    this.room.localParticipant.unpublishTrack(localTrack)
    if (localTrack.kind === VIDEO) {
      this.setState({ localVideoTrack: null })
    } else if (localTrack.kind === AUDIO) {
      this.setState({ localAudioTrack: null })
    }
  }
  publishLocalTrack = localTrack => {
    this.room.localParticipant.publishTrack(localTrack)
    if (localTrack.kind === VIDEO) {
      this.setState({ localVideoTrack: localTrack })
    } else if (localTrack.kind === AUDIO) {
      this.setState({ localAudioTrack: localTrack })
    }
  }
  handleToggleVideoClick = async () => {
    const { localVideoTrack } = this.state
    console.log(localVideoTrack)
    if (!localVideoTrack) {
      const newLocalVideoTrack = await createLocalVideoTrack({ width: 1280 })
      this.publishLocalTrack(newLocalVideoTrack)
    } else {
      this.unpublishLocalTrack(localVideoTrack)
    }
  }
  handleToggleAudioClick = async () => {
    const { localAudioTrack } = this.state
    console.log(localAudioTrack)
    if (!localAudioTrack) {
      const newLocalAudioTrack = await createLocalAudioTrack()
      this.publishLocalTrack(newLocalAudioTrack)
    } else {
      this.unpublishLocalTrack(localAudioTrack)
    }
  }
  render() {
    const { remoteVideoTracks, remoteAudioTracks, localVideoTrack, localAudioTrack } = this.state
    const remoteVideoTracksArr = Object.values(remoteVideoTracks)
    const remoteAudioTracksArr = Object.values(remoteAudioTracks)
    const isRemoteVideoTrack = remoteVideoTracksArr.length > 0
    const isRemoteAudioTrack = remoteAudioTracksArr.length > 0
    return (
      <Wrapper>
        <Controls
          isVideoEnabled={!!localVideoTrack}
          isAudioEnabled={!!localAudioTrack}
          onToggleVideoClick={this.handleToggleVideoClick}
          onToggleAudioClick={this.handleToggleAudioClick}
        />
        {(isRemoteAudioTrack || isRemoteVideoTrack) && (
          <RemoteVideo
            autoPlay
            playsInline
            ref={videoEl => {
              if (videoEl) {
                videoEl.srcObject = new MediaStream([
                  ...(isRemoteAudioTrack ? remoteAudioTracksArr.map(getMediaStreamTrack) : []),
                  ...(isRemoteVideoTrack ? remoteVideoTracksArr.map(getMediaStreamTrack) : [])
                ])
              }
            }}
          />
        )}
        {localVideoTrack && (
          <LocalVideo
            autoPlay
            playsInline
            ref={videoEl => {
              if (videoEl) {
                videoEl.srcObject = new MediaStream([getMediaStreamTrack(localVideoTrack)])
              }
            }}
          />
        )}
      </Wrapper>
    )
  }
}

Video.propTypes = {
  room: PropTypes.object.isRequired
}

export default Video
