const mongoose = require("mongoose")

const meetingSchema = new mongoose.Schema({
  meetingCode: {
    type: String,
    required: true,
    unique: true
  },

  title: {
    type: String,
    required: true
  },

  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  adminIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  status: {
    type: String,
    enum: ["scheduled", "live", "ended"],
    default: "scheduled"
  },

  participantCap: {
    type: Number,
    default: 2000
  },

  chatEnabled: {
    type: Boolean,
    default: true
  },

  raiseHandEnabled: {
    type: Boolean,
    default: true
  },

  pollEnabled: {
    type: Boolean,
    default: true
  },

  recordingEnabled: {
    type: Boolean,
    default: true
  },

  startedAt: Date,
  endedAt: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Meeting", meetingSchema)