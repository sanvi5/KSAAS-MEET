const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    idNumber: {
      type: String,
      required: true
    },

    displayName: {
      type: String,
      required: true
    },

    roleAtJoin: {
      type: String,
      enum: ["host", "admin", "participant"],
      required: true
    },

    joinedAt: {
      type: Date,
      default: Date.now
    },

    leftAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("Attendance", attendanceSchema)