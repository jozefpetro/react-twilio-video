import React from 'react'
import styled from 'styled-components'

const StyledVideo = styled.video`
  position: absolute;
  width: 20%;
  min-width: 150px;
  top: 20px;
  right: 20px;
  border-radius: 6px;
`

const LocalVideo = ({ getVideoRef, ...props }) => <StyledVideo {...props} ref={getVideoRef} />

export default LocalVideo
