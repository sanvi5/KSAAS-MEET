const Attendance = require("../models/Attendance")
const Meeting = require("../models/Meeting")

const escapeCsv = (value) => {
  const stringValue = value === undefined || value === null ? "" : String(value)
  return `"${stringValue.replace(/"/g, '""')}"`
}

const toIso = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString()
}

const exportAttendance = async (req, res) => {
  try {
    const { meetingId } = req.params

    const meeting = await Meeting.findById(meetingId).lean()
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }

    const rows = await Attendance.find({ meetingId }).sort({ joinedAt: 1 }).lean()

    const header = [
      "Meeting Title",
      "Meeting Code",
      "ID Number",
      "Display Name",
      "Role At Join",
      "Joined At",
      "Left At",
      "Duration Minutes"
    ]

    const csvRows = rows.map((row) => {
      const joined = row.joinedAt ? new Date(row.joinedAt) : null
      const left = row.leftAt ? new Date(row.leftAt) : null

      let durationMinutes = ""
      if (joined && left && !Number.isNaN(joined.getTime()) && !Number.isNaN(left.getTime())) {
        durationMinutes = Math.max(
          0,
          Math.round((left.getTime() - joined.getTime()) / 60000)
        )
      }

      return [
        meeting.title || "",
        meeting.meetingCode || "",
        row.idNumber || "",
        row.displayName || "",
        row.roleAtJoin || "",
        toIso(row.joinedAt),
        toIso(row.leftAt),
        durationMinutes
      ]
    })

    const csv = [
      header.map(escapeCsv).join(","),
      ...csvRows.map((row) => row.map(escapeCsv).join(","))
    ].join("\n")

    const safeCode = (meeting.meetingCode || "meeting").replace(/[^a-zA-Z0-9-_]/g, "_")

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeCode}_attendance.csv"`
    )

    return res.status(200).send(csv)
  } catch (error) {
    console.error("Attendance export error:", error.message)
    return res.status(500).json({ message: "Failed to export attendance" })
  }
}

module.exports = exportAttendance