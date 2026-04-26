const express = require("express")
const cors = require("cors")

const authRoutes = require("./routes/auth.routes")
const meetingRoutes = require("./routes/meetings.routes")
const attendanceRoutes = require("./routes/attendance.routes")
const exportRoutes = require("./routes/export.routes")
const livekitRoutes = require("./routes/livekit.routes")
const stageRoutes = require("./routes/stage.routes")
const pollRoutes = require("./routes/poll.routes")
const livekitControlRoutes = require("./routes/livekitControl.routes")
const chatRoutes = require("./routes/chat.routes")

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning"
    ]
  })
)

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/meetings", meetingRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/export", exportRoutes)
app.use("/api/livekit", livekitRoutes)
app.use("/api/stage", stageRoutes)
app.use("/api/polls", pollRoutes)
app.use("/api/livekit-control", livekitControlRoutes)
app.use("/api/chat", chatRoutes)
app.get("/", (req, res) => {
  res.send("KSAAS Meet backend running")
})

module.exports = app