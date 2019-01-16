require('dotenv').config()
const express = require('express')
const cors = require('cors')
const twilio = require('twilio')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.get('/token/:identity', (req, res) => {
  const videoGrant = new twilio.jwt.AccessToken.VideoGrant()
  const token = new twilio.jwt.AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  )
  token.addGrant(videoGrant)
  token.identity = req.params.identity
  res.status(200).json({ token: token.toJwt() })
})

app.get('*', (req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

app.listen(port, () => {
  console.log(`Demo-server app listening on port ${port}!`)
})
