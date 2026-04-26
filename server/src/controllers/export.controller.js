const exportAttendanceCSV = require("../services/attendanceExport.service")

const exportMeetingAttendance = async (req, res) => {
  try {
    const { meetingId } = req.params

    const csv = await exportAttendanceCSV(meetingId)

    res.setHeader("Content-Type", "text/csv")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendance-${meetingId}.csv"`
    )

    res.send(csv)
  } catch (error) {
    console.error("Export attendance error:", error.message)
    res.status(500).json({ message: "Failed to export attendance" })
  }
}

module.exports = { exportMeetingAttendance }