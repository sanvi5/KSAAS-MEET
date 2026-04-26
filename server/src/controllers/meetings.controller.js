const Meeting = require("../models/Meeting")
const User = require("../models/User")

const generateMeetingCode = () => {
  const part = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KSAAS-${part}`
}

const createMeeting = async (req, res) => {
  try {
    if (req.user.role !== "host") {
      return res.status(403).json({ message: "Only host can create meetings" })
    }

    const {
      title,
      adminIdNumbers = [],
      participantCap = 2000,
      chatEnabled = true,
      raiseHandEnabled = true,
      pollEnabled = true,
      recordingEnabled = true
    } = req.body

    if (!title) {
      return res.status(400).json({ message: "Title is required" })
    }

    const admins = await User.find({
      idNumber: { $in: adminIdNumbers },
      role: "admin",
      active: true
    })

    const meeting = await Meeting.create({
      meetingCode: generateMeetingCode(),
      title,
      hostId: req.user.id,
      adminIds: admins.map(admin => admin._id),
      participantCap,
      chatEnabled,
      raiseHandEnabled,
      pollEnabled,
      recordingEnabled
    })

    res.status(201).json(meeting)
  } catch (error) {
    console.error("Create meeting error:", error.message)
    res.status(500).json({ message: "Failed to create meeting" })
  }
}

const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate("hostId", "idNumber role")
      .populate("adminIds", "idNumber role")
      .sort({ createdAt: -1 })

    res.json(meetings)
  } catch (error) {
    console.error("Get meetings error:", error.message)
    res.status(500).json({ message: "Failed to fetch meetings" })
  }
}

const startMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params

    const meeting = await Meeting.findById(meetingId)

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }

    if (String(meeting.hostId) !== req.user.id) {
      return res.status(403).json({ message: "Only host can start meeting" })
    }

    meeting.status = "live"
    meeting.startedAt = new Date()
    await meeting.save()

    res.json({ message: "Meeting started", meeting })
  } catch (error) {
    console.error("Start meeting error:", error.message)
    res.status(500).json({ message: "Failed to start meeting" })
  }
}

const endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params

    const meeting = await Meeting.findById(meetingId)

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }

    if (String(meeting.hostId) !== req.user.id) {
      return res.status(403).json({ message: "Only host can end meeting" })
    }

    meeting.status = "ended"
    meeting.endedAt = new Date()
    await meeting.save()

    res.json({ message: "Meeting ended", meeting })
  } catch (error) {
    console.error("End meeting error:", error.message)
    res.status(500).json({ message: "Failed to end meeting" })
  }
}

const joinMeeting = async (req, res) => {
  try {
    const { meetingCode } = req.params

    const meeting = await Meeting.findOne({ meetingCode })

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }

    if (meeting.status !== "live") {
      return res.status(400).json({ message: "Meeting is not live yet" })
    }

    res.json({
      message: "Meeting join allowed",
      meeting
    })
  } catch (error) {
    console.error("Join meeting error:", error.message)
    res.status(500).json({ message: "Failed to join meeting" })
  }
}

module.exports = {
  createMeeting,
  getMeetings,
  startMeeting,
  endMeeting,
  joinMeeting
}