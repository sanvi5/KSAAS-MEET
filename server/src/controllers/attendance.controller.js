const Attendance = require("../models/Attendance")

exports.markJoin = async (req, res) => {
  try {
    const { meetingId } = req.params
    const userId = req.user.id || req.user._id
    const idNumber = req.user.idNumber
    const role = req.user.role
    const displayName =
      req.body.displayName ||
      req.user.displayName ||
      req.user.name ||
      idNumber

    if (!meetingId) {
      return res.status(400).json({ message: "Meeting ID is required" })
    }

    const existingOpenRecord = await Attendance.findOne({
      meetingId,
      userId,
      leftAt: null
    })

    if (existingOpenRecord) {
      return res.status(200).json(existingOpenRecord)
    }

    const record = await Attendance.create({
      meetingId,
      userId,
      idNumber,
      displayName,
      roleAtJoin: role,
      joinedAt: new Date(),
      leftAt: null
    })

    return res.status(201).json(record)
  } catch (error) {
    console.error("markJoin error:", error.message)
    return res.status(500).json({ message: "Join attendance failed" })
  }
}

exports.markLeave = async (req, res) => {
  try {
    const { meetingId } = req.params
    const userId = req.user.id || req.user._id

    if (!meetingId) {
      return res.status(400).json({ message: "Meeting ID is required" })
    }

    const record = await Attendance.findOne({
      meetingId,
      userId,
      leftAt: null
    }).sort({ joinedAt: -1 })

    if (!record) {
      return res.status(200).json({ message: "No active attendance session found" })
    }

    record.leftAt = new Date()
    await record.save()

    return res.status(200).json(record)
  } catch (error) {
    console.error("markLeave error:", error.message)
    return res.status(500).json({ message: "Leave attendance failed" })
  }
}

exports.getAttendanceByMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params

    const records = await Attendance.find({ meetingId }).sort({ joinedAt: 1 })

    return res.status(200).json(records)
  } catch (error) {
    console.error("getAttendanceByMeeting error:", error.message)
    return res.status(500).json({ message: "Failed to fetch attendance" })
  }
}