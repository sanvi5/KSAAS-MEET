const express = require("express")
const router = express.Router()

const protect = require("../middleware/auth.middleware")
const {
  createMeeting,
  getMeetings,
  startMeeting,
  endMeeting,
  joinMeeting
} = require("../controllers/meetings.controller")

router.get("/", protect, getMeetings)
router.post("/", protect, createMeeting)
router.patch("/:meetingId/start", protect, startMeeting)
router.patch("/:meetingId/end", protect, endMeeting)
router.get("/join/:meetingCode", protect, joinMeeting)

module.exports = router