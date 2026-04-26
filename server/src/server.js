const http = require("http")
const app = require("./app")
const connectDB = require("./config/db")
const { initSocket } = require("./realtime/socketServer")
const syncUsers = require("./services/googleSheetSync.service")
const { PORT } = require("./config/env")

const startServer = async () => {
  try {
    console.log("Starting server...")

    await connectDB()
    console.log("MongoDB connected successfully")

    console.log("Running initial Google Sheets sync...")
    await syncUsers()
    console.log("Users synced from Google Sheets")

    const server = http.createServer(app)
    initSocket(server)

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })

    setInterval(async () => {
      console.log("Running scheduled Google Sheets sync...")
      await syncUsers()
      console.log("Users synced from Google Sheets")
    }, 43200000)
  } catch (error) {
    console.error("Server startup error:", error.message)
    process.exit(1)
  }
}

startServer()