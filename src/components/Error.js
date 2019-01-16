import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const StyledH2 = styled.h2`
  color: red;
`

const Error = ({ message }) => <StyledH2>{message}</StyledH2>

Error.propTypes = {
  message: PropTypes.string.isRequired
}

export default Error
