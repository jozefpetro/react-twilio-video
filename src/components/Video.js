import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { connect, createLocalAudioTrack, createLocalVideoTrack } from 'twilio-video'
import ParticipantsList from './ParticipantsList'
import LocalVideo from './LocalVideo'
import RemoteVideo from './RemoteVideo'
import Controls from './Controls'
import Loading from './Loading'
import Error from './Error'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
`

const PARTICIPANT_CONNECTED = 'participantConnected'
const PARTICIPANT_DISCONNECTED = 'participantDisconnected'
const TRACK_SUBSCRIBED = 'trackSubscribed'
const TRACK_UNSUBSCRIBED = 'trackUnsubscribed'
const DOMINANT_SPEAKER_CHANGED = 'dominantSpeakerChanged'

const AUDIO = 'audio'
const VIDEO = 'video'

const getMediaStreamTrack = track => track.mediaStreamTrack

class Video extends React.Component {
  state = {
    remoteParticipants: {},
    dominantRemoteVideoTrack: null,
    remoteVideoTracks: {},
    remoteAudioTracks: {},
    localVideoTrack: null,
    localVideoTrack: null,
    isRoomConnecting: false,
    connectRoomError: null
  }
  room = null
  async componentDidMount() {
    this.setState({ isRoomConnecting: true })
    try {
      await this.initRoom()
      this.setState({ isRoomConnecting: false })
    } catch (error) {
      this.setState({ connectRoomError: error.message, isRoomConnecting: false })
    }
  }
  componentWillUnmount() {
    const { localVideoTrack, localAudioTrack } = this.state
    if (!this.room) return
    if (localVideoTrack) this.unpublishLocalTrack(localVideoTrack)
    if (localAudioTrack) this.unpublishLocalTrack(localAudioTrack)
    this.room.removeListener(PARTICIPANT_CONNECTED, this.handleParticipantConnected)
    this.room.removeListener(PARTICIPANT_DISCONNECTED, this.handleParticipantDisconnected)
    this.room.removeListener(DOMINANT_SPEAKER_CHANGED, this.handleDominantSpeakerChanged)
    this.room.disconnect()
  }
  initRoom = async () => {
    const { token, connectSettings } = this.props
    this.room = await connect(
      token,
      {
        preferredVideoCodecs: ['H264', 'VP8'],
        audio: true,
        video: false,
        dominantSpeaker: true,
        ...connectSettings
      }
    )
    this.room.participants.forEach(participant => {
      this.handleParticipantConnected(participant)
    })
    this.room.on(PARTICIPANT_CONNECTED, this.handleParticipantConnected)
    this.room.on(PARTICIPANT_DISCONNECTED, this.handleParticipantDisconnected)
    this.room.on(DOMINANT_SPEAKER_CHANGED, this.handleDominantSpeakerChanged)
    const localAudioTrack = this.room.localParticipant.audioTracks.values().next().value
    const localVideoTrack = this.room.localParticipant.videoTracks.values().next().value
    if (localAudioTrack) {
      this.publishLocalTrack(localAudioTrack)
    }
    if (localVideoTrack) {
      this.publishLocalTrack(localVideoTrack)
    }
  }
  handleDominantSpeakerChanged = remoteParticipant => {
    if (remoteParticipant) {
      const dominantRemoteVideoTrack = remoteParticipant.videoTracks.values().next().value
      if (dominantRemoteVideoTrack) {
        this.setState({ dominantRemoteVideoTrack })
      }
    } else {
      this.setState({ dominantRemoteVideoTrack: null })
    }
  }
  handleParticipantConnected = participant => {
    const { onParticipantConnected } = this.props
    if (onParticipantConnected) onParticipantConnected(participant)
    participant.on(TRACK_SUBSCRIBED, this.handleRemoteTrackCreate)
    participant.on(TRACK_UNSUBSCRIBED, this.handleRemoteTrackRemove)
    this.setState(({ remoteParticipants }) => ({
      remoteParticipants: { ...remoteParticipants, [participant.identity]: participant }
    }))
  }
  handleParticipantDisconnected = participant => {
    const { onparticipantDisconnected } = this.props
    if (onparticipantDisconnected) onParticipantConnected(onparticipantDisconnected)
    participant.removeListener(TRACK_SUBSCRIBED, this.handleRemoteTrackCreate)
    participant.removeListener(TRACK_UNSUBSCRIBED, this.handleRemoteTrackRemove)
    this.setState(
      ({
        remoteParticipants: {
          [participant.identity]: deletedRemoteParticipant,
          ...restRemoteParticipants
        }
      }) => ({
        remoteParticipants: restRemoteParticipants
      })
    )
  }
  handleRemoteTrackCreate = remoteTrack => {
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
    if (!localVideoTrack) {
      const newLocalVideoTrack = await createLocalVideoTrack({ width: 1280 })
      this.publishLocalTrack(newLocalVideoTrack)
    } else {
      this.unpublishLocalTrack(localVideoTrack)
    }
  }
  handleToggleAudioClick = async () => {
    const { localAudioTrack } = this.state
    if (!localAudioTrack) {
      const newLocalAudioTrack = await createLocalAudioTrack()
      this.publishLocalTrack(newLocalAudioTrack)
    } else {
      this.unpublishLocalTrack(localAudioTrack)
    }
  }
  render() {
    const {
      remoteParticipants,
      dominantRemoteVideoTrack,
      remoteVideoTracks,
      remoteAudioTracks,
      localVideoTrack,
      localAudioTrack,
      isRoomConnecting,
      connectRoomError
    } = this.state
    const {
      loadingComp: LoadingComp,
      errorComp: ErrorComp,
      localVideoComp: LocalVideoComp,
      remoteVideoComp: RemoteVideoComp,
      controlsComp: ControlsComp
    } = this.props
    const remoteVideoTracksArr = Object.values(remoteVideoTracks)
    const remoteAudioTracksArr = Object.values(remoteAudioTracks)
    const isRemoteVideoTrack = remoteVideoTracksArr.length > 0
    const isRemoteAudioTrack = remoteAudioTracksArr.length > 0
    let remoteVideoTrack = null
    if (isRemoteVideoTrack) {
      remoteVideoTrack = dominantRemoteVideoTrack || remoteVideoTracksArr[0]
    }
    return (
      <Wrapper>
        <ControlsComp
          isVideoEnabled={!!localVideoTrack}
          isAudioEnabled={!!localAudioTrack}
          onToggleVideoClick={this.handleToggleVideoClick}
          onToggleAudioClick={this.handleToggleAudioClick}
        />
        {isRoomConnecting && <LoadingComp />}
        {connectRoomError && <ErrorComp message={connectRoomError} />}
        <ParticipantsList remoteParticipants={Object.values(remoteParticipants)} />
        {(isRemoteAudioTrack || isRemoteVideoTrack) && (
          <RemoteVideoComp
            autoPlay
            playsInline
            ref={videoEl => {
              if (videoEl) {
                videoEl.srcObject = new MediaStream([
                  ...(isRemoteAudioTrack ? remoteAudioTracksArr.map(getMediaStreamTrack) : []),
                  ...(isRemoteVideoTrack ? [getMediaStreamTrack(remoteVideoTrack)] : [])
                ])
              }
            }}
          />
        )}
        {localVideoTrack && (
          <LocalVideoComp
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

Video.defaultProps = {
  loadingComp: Loading,
  errorComp: Error,
  localVideoComp: LocalVideo,
  remoteVideoComp: RemoteVideo,
  controlsComp: Controls
}

Video.propTypes = {
  token: PropTypes.string.isRequired,
  connectSettings: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  onParticipantConnected: PropTypes.func,
  onparticipantDisconnected: PropTypes.func
}

export default Video
