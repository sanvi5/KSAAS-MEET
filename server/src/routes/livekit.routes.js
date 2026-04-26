const express = require("express")
const router = express.Router()

const protect = require("../middleware/auth.middleware")
const { createLivekitToken } = require("../controllers/livekit.controller")

router.post("/token", protect, createLivekitToken)

module.exports = router