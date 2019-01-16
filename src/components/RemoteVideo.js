import React from 'react'
import styled from 'styled-components'

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
`

const RemoteVideo = ({ getVideoRef, ...props }) => <StyledVideo {...props} ref={getVideoRef} />

export default RemoteVideo
