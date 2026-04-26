const express = require("express")
const router = express.Router()

const protect = require("../middleware/auth.middleware")

const {
  getRoomMessages,
  sendRoomMessage
} = require("../controllers/chat.controller")

router.get("/:roomName", protect, getRoomMessages)
router.post("/:roomName", protect, sendRoomMessage)

module.exports = router