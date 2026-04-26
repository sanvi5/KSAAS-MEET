const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  idNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["host", "admin", "participant"],
    default: "participant"
  },

  active: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("User", userSchema)