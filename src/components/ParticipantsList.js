import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Wrapper = styled.div`
  position: absolute;
  left: 0;
  bottom: 20px;
`

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  margin-left: 20px;
  background-color: gray;
  border-radius: 50%;
  font-size: 2em;
  color: white;
`

const ParticipantsList = ({ remoteParticipants }) => (
  <Wrapper>
    {remoteParticipants.map(({ identity }) => (
      <ParticipantItem key={identity}>{identity[0]}</ParticipantItem>
    ))}
  </Wrapper>
)

ParticipantsList.propTypes = {
  remoteParticipants: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default ParticipantsList
