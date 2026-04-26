const {
  getStageState,
  requestToSpeak,
  approveSpeaker,
  allowCamera,
  demoteSpeaker
} = require("../state/stageState")

function isHostOrAdmin(req) {
  return req.user?.role === "host" || req.user?.role === "admin"
}

exports.getStage = async (req, res) => {
  try {
    const { roomName } = req.params
    return res.json(getStageState(roomName))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.raiseHand = async (req, res) => {
  try {
    const { roomName } = req.params

    const identity = String(req.user.idNumber || req.user.id || req.user._id)

    const state = requestToSpeak(roomName, {
      identity,
      name: req.user.displayName || req.user.name || req.user.idNumber || "User",
      role: req.user.role
    })

    return res.json(state)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.approveSpeakerRequest = async (req, res) => {
  try {
    if (!isHostOrAdmin(req)) {
      return res.status(403).json({ message: "Only host/admin can approve speakers" })
    }

    const { roomName } = req.params
    const { identity, name, role } = req.body

    const state = approveSpeaker(roomName, {
      identity,
      name,
      role: role || "participant"
    })

    return res.json(state)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

exports.allowCameraRequest = async (req, res) => {
  try {
    if (!isHostOrAdmin(req)) {
      return res.status(403).json({ message: "Only host/admin can allow camera" })
    }

    const { roomName } = req.params
    const { identity, name, role } = req.body

    const state = allowCamera(roomName, {
      identity,
      name,
      role: role || "participant"
    })

    return res.json(state)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

exports.demoteSpeakerRequest = async (req, res) => {
  try {
    if (!isHostOrAdmin(req)) {
      return res.status(403).json({ message: "Only host/admin can demote speakers" })
    }

    const { roomName, identity } = req.params
    const state = demoteSpeaker(roomName, identity)

    return res.json(state)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}