const path = require("path")
const dotenv = require("dotenv")

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

module.exports = {
  PORT: process.env.PORT || 5001,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  SHEET_ID: process.env.SHEET_ID
}