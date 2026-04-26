const { AccessToken } = require("livekit-server-sdk")
const {
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET
} = require("../config/livekit")

const { isSpeaker, isCameraAllowed } = require("../state/stageState")

exports.createLivekitToken = async (req, res) => {
  try {
    const { roomName, participantName } = req.body

    const userId = req.user?.id || req.user?._id
    const idNumber = req.user?.idNumber
    const role = req.user?.role

    if (!roomName) {
      return res.status(400).json({ message: "roomName is required" })
    }

    const identity = String(idNumber || userId || participantName || "user")
    const name = String(participantName || idNumber || "User")

    const isHostOrAdmin = role === "host" || role === "admin"
    const speaker = isHostOrAdmin || isSpeaker(roomName, identity)
    const cameraAllowed = isHostOrAdmin || isCameraAllowed(roomName, identity)

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name,
      ttl: "4h"
    })

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: speaker,
      canSubscribe: true,
      canPublishData: true
    })

    return res.json({
      token: await token.toJwt(),
      url: LIVEKIT_URL,
      identity,
      name,
      role,
      canPublish: speaker,
      canUseMic: speaker,
      canUseCamera: cameraAllowed,
      canShareScreen: isHostOrAdmin
    })
  } catch (error) {
    console.error("LiveKit token error:", error.message)
    return res.status(500).json({ message: "Failed to create LiveKit token" })
  }
}