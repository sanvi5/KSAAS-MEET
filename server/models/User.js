const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  idNumber: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
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

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("User", userSchema)