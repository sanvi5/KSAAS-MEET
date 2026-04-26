const {
  MAX_MIC_SPEAKERS,
  MAX_CAMERA_PUBLISHERS
} = require("../config/meetingLimits")

const rooms = {}

function ensureRoom(roomName) {
  if (!rooms[roomName]) {
    rooms[roomName] = {
      speakers: new Map(),
      cameraAllowed: new Map(),
      handRequests: new Map()
    }
  }

  return rooms[roomName]
}

function getStageState(roomName) {
  const room = ensureRoom(roomName)

  return {
    speakers: Array.from(room.speakers.values()),
    cameraAllowed: Array.from(room.cameraAllowed.values()),
    handRequests: Array.from(room.handRequests.values()),
    limits: {
      maxMicSpeakers: MAX_MIC_SPEAKERS,
      maxCameraPublishers: MAX_CAMERA_PUBLISHERS
    }
  }
}

function isSpeaker(roomName, identity) {
  const room = ensureRoom(roomName)
  return room.speakers.has(identity)
}

function isCameraAllowed(roomName, identity) {
  const room = ensureRoom(roomName)
  return room.cameraAllowed.has(identity)
}

function requestToSpeak(roomName, user) {
  const room = ensureRoom(roomName)

  room.handRequests.set(user.identity, {
    identity: user.identity,
    name: user.name,
    role: user.role,
    requestedAt: new Date().toISOString()
  })

  return getStageState(roomName)
}

function approveSpeaker(roomName, user) {
  const room = ensureRoom(roomName)

  if (room.speakers.size >= MAX_MIC_SPEAKERS) {
    throw new Error("Speaker limit reached")
  }

  room.handRequests.delete(user.identity)

  room.speakers.set(user.identity, {
    identity: user.identity,
    name: user.name,
    role: user.role,
    approvedAt: new Date().toISOString()
  })

  return getStageState(roomName)
}

function allowCamera(roomName, user) {
  const room = ensureRoom(roomName)

  if (room.cameraAllowed.size >= MAX_CAMERA_PUBLISHERS) {
    throw new Error("Camera publisher limit reached")
  }

  room.cameraAllowed.set(user.identity, {
    identity: user.identity,
    name: user.name,
    role: user.role,
    approvedAt: new Date().toISOString()
  })

  return getStageState(roomName)
}

function demoteSpeaker(roomName, identity) {
  const room = ensureRoom(roomName)

  room.speakers.delete(identity)
  room.cameraAllowed.delete(identity)

  return getStageState(roomName)
}

function clearStageRoom(roomName) {
  delete rooms[roomName]
}

module.exports = {
  getStageState,
  isSpeaker,
  isCameraAllowed,
  requestToSpeak,
  approveSpeaker,
  allowCamera,
  demoteSpeaker,
  clearStageRoom
}