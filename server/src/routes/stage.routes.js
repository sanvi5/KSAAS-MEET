const express = require("express")
const router = express.Router()

const protect = require("../middleware/auth.middleware")

const {
  getStage,
  raiseHand,
  approveSpeakerRequest,
  allowCameraRequest,
  demoteSpeakerRequest
} = require("../controllers/stage.controller")

router.get("/:roomName", protect, getStage)
router.post("/:roomName/raise-hand", protect, raiseHand)
router.post("/:roomName/approve-speaker", protect, approveSpeakerRequest)
router.post("/:roomName/allow-camera", protect, allowCameraRequest)
router.delete("/:roomName/speaker/:identity", protect, demoteSpeakerRequest)

module.exports = router