import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  position: absolute;
  flex-direction: column;
  top: 0;
  left: 20px;
`

const ControlButton = styled.button`
  margin-top: 20px;
  width: 50px;
  height: 50px;
  border-radius: 6px;
  color: ${({ isEnabled }) => (isEnabled ? 'red' : 'black')};
`

const Controls = ({ onToggleAudioClick, onToggleVideoClick, isVideoEnabled, isAudioEnabled }) => (
  <Wrapper>
    <ControlButton isEnabled={isVideoEnabled} onClick={onToggleVideoClick}>
      Video
    </ControlButton>
    <ControlButton isEnabled={isAudioEnabled} onClick={onToggleAudioClick}>
      Mic
    </ControlButton>
  </Wrapper>
)

Controls.propTypes = {
  onToggleAudioClick: PropTypes.func.isRequired,
  onToggleVideoClick: PropTypes.func.isRequired,
  isVideoEnabled: PropTypes.bool.isRequired,
  isAudioEnabled: PropTypes.bool.isRequired
}

export default Controls
