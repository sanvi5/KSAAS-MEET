const express = require("express")
const router = express.Router()

const protect = require("../middleware/auth.middleware")

const {
  getRoomPolls,
  createRoomPoll,
  voteRoomPoll
} = require("../controllers/poll.controller")

router.get("/:roomName", protect, getRoomPolls)

router.post("/:roomName", protect, createRoomPoll)

router.post("/:roomName/:pollId/vote", protect, voteRoomPoll)

module.exports = router