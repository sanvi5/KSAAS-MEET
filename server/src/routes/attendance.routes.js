const express = require("express")
const router = express.Router()

const protect = require("../middleware/auth.middleware")
const {
  markJoin,
  markLeave,
  getAttendanceByMeeting
} = require("../controllers/attendance.controller")

router.post("/:meetingId/join", protect, markJoin)
router.patch("/:meetingId/leave", protect, markLeave)
router.get("/:meetingId", protect, getAttendanceByMeeting)

module.exports = router