const express = require("express")
const router = express.Router()

const protect = require("../middleware/auth.middleware")
const exportAttendance = require("../services/attendanceExport.service")

router.get("/attendance/:meetingId", protect, exportAttendance)

module.exports = router