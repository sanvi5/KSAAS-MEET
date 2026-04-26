const { getMessages, addMessage } = require("../state/chatState")

exports.getRoomMessages = async (req, res) => {
  try {
    const { roomName } = req.params
    return res.status(200).json(getMessages(roomName))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.sendRoomMessage = async (req, res) => {
  try {
    const { roomName } = req.params
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message is required" })
    }

    const messages = addMessage(roomName, {
      senderId: String(req.user.idNumber || req.user.id || req.user._id),
      senderName: req.user.displayName || req.user.name || req.user.idNumber || "User",
      senderRole: req.user.role,
      text: text.trim()
    })

    return res.status(201).json(messages)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}