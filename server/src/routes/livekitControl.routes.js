const express = require("express")
const router = express.Router()

const protect = require("../middleware/auth.middleware")

const {
  forceMuteMic,
  forceCameraOff,
  removeFromStage,
  endLivekitRoom
} = require("../controllers/livekitControl.controller")

router.patch("/:roomName/:identity/mute-mic", protect, forceMuteMic)
router.patch("/:roomName/:identity/camera-off", protect, forceCameraOff)
router.delete("/:roomName/:identity/stage", protect, removeFromStage)
router.delete("/:roomName/end", protect, endLivekitRoom)

module.exports = router