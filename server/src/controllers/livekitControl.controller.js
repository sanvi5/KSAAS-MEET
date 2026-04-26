const { RoomServiceClient } = require("livekit-server-sdk")
const {
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET
} = require("../config/livekit")
const { demoteSpeaker } = require("../state/stageState")

function isHostOrAdmin(req) {
  return req.user?.role === "host" || req.user?.role === "admin"
}

function getRoomClient() {
  return new RoomServiceClient(
    LIVEKIT_URL.replace("wss://", "https://"),
    LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET
  )
}

async function findTrackSid(roomName, identity, sourceType) {
  const client = getRoomClient()
  const participants = await client.listParticipants(roomName)
  const participant = participants.find((p) => p.identity === identity)

  if (!participant) {
    throw new Error("Participant not found")
  }

  const track = participant.tracks.find((t) => {
    const source = String(t.source || "").toLowerCase()
    return source.includes(sourceType)
  })

  if (!track) {
    throw new Error(`${sourceType} track not found`)
  }

  return track.sid
}

exports.forceMuteMic = async (req, res) => {
  try {
    if (!isHostOrAdmin(req)) {
      return res.status(403).json({ message: "Only host/admin can mute others" })
    }

    const { roomName, identity } = req.params
    const client = getRoomClient()
    const trackSid = await findTrackSid(roomName, identity, "microphone")

    await client.mutePublishedTrack(roomName, identity, trackSid, true)

    return res.json({ message: "Participant microphone muted" })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

exports.forceCameraOff = async (req, res) => {
  try {
    if (!isHostOrAdmin(req)) {
      return res.status(403).json({ message: "Only host/admin can turn off camera" })
    }

    const { roomName, identity } = req.params
    const client = getRoomClient()
    const trackSid = await findTrackSid(roomName, identity, "camera")

    await client.mutePublishedTrack(roomName, identity, trackSid, true)

    demoteSpeaker(roomName, identity)

    return res.json({ message: "Participant camera turned off" })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

exports.removeFromStage = async (req, res) => {
  try {
    if (!isHostOrAdmin(req)) {
      return res.status(403).json({ message: "Only host/admin can remove speakers" })
    }

    const { roomName, identity } = req.params
    const state = demoteSpeaker(roomName, identity)

    return res.json({
      message: "Participant removed from stage permissions",
      state
    })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

exports.endLivekitRoom = async (req, res) => {
  try {
    if (!isHostOrAdmin(req)) {
      return res.status(403).json({ message: "Only host/admin can end meeting" })
    }

    const { roomName } = req.params
    const client = getRoomClient()

    await client.deleteRoom(roomName)

    return res.json({ message: "Meeting ended for everyone" })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}