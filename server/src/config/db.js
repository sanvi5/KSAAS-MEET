const mongoose = require("mongoose")
const { MONGO_URI } = require("./env")

const connectDB = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env")
  }

  await mongoose.connect(MONGO_URI)
}

module.exports = connectDB