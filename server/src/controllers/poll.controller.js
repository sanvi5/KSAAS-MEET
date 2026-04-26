const {
  getPolls,
  createPoll,
  votePoll
} = require("../state/pollState")

function isHostOrAdmin(req) {
  return req.user?.role === "host" || req.user?.role === "admin"
}

exports.getRoomPolls = async (req, res) => {
  try {
    const { roomName } = req.params

    return res.status(200).json(getPolls(roomName))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.createRoomPoll = async (req, res) => {
  try {
    if (!isHostOrAdmin(req)) {
      return res.status(403).json({
        message: "Only host/admin can create polls"
      })
    }

    const { roomName } = req.params
    const { question, options } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Poll question is required"
      })
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: "At least two poll options are required"
      })
    }

    const cleanOptions = options
      .map((option) => String(option).trim())
      .filter(Boolean)

    if (cleanOptions.length < 2) {
      return res.status(400).json({
        message: "At least two valid options are required"
      })
    }

    const createdBy = String(
      req.user.idNumber || req.user.id || req.user._id || "unknown"
    )

    const polls = createPoll(roomName, question.trim(), cleanOptions, createdBy)

    return res.status(201).json(polls)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.voteRoomPoll = async (req, res) => {
  try {
    const { roomName, pollId } = req.params
    const { optionIndex } = req.body

    const userId = String(
      req.user.idNumber || req.user.id || req.user._id || "unknown"
    )

    const polls = votePoll(roomName, pollId, Number(optionIndex), userId)

    return res.status(200).json(polls)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}