const { Server } = require("socket.io")

let io

const rooms = {}

const ensureRoom = (meetingCode) => {
  if (!rooms[meetingCode]) {
    rooms[meetingCode] = {
      participants: [],
      raisedHands: [],
      polls: []
    }
  }
  return rooms[meetingCode]
}

const participantSort = (a, b) => {
  const rolePriority = { host: 3, admin: 2, participant: 1 }

  if ((rolePriority[b.role] || 0) !== (rolePriority[a.role] || 0)) {
    return (rolePriority[b.role] || 0) - (rolePriority[a.role] || 0)
  }

  if (b.isScreenSharing !== a.isScreenSharing) {
    return Number(b.isScreenSharing) - Number(a.isScreenSharing)
  }

  if (b.isSpeaking !== a.isSpeaking) {
    return Number(b.isSpeaking) - Number(a.isSpeaking)
  }

  return 0
}

const getGroupedParticipants = (participants) => {
  const grouped = new Map()

  for (const p of participants) {
    if (!grouped.has(p.idNumber)) {
      grouped.set(p.idNumber, {
        idNumber: p.idNumber,
        name: p.name,
        role: p.role,
        deviceCount: 1,
        sessions: [p],
        isSpeaking: p.isSpeaking,
        hasRaisedHand: p.hasRaisedHand,
        hasVideo: p.hasVideo,
        hasAudio: p.hasAudio,
        isScreenSharing: p.isScreenSharing,
        isPrimaryMedia: p.isPrimaryMedia,
        joinedAt: p.joinedAt
      })
    } else {
      const existing = grouped.get(p.idNumber)

      const exists = existing.sessions.find(
        (s) => s.sessionId === p.sessionId
      )

      if (!exists) {
        existing.sessions.push(p)
        existing.deviceCount += 1
      }

      existing.isSpeaking = existing.isSpeaking || p.isSpeaking
      existing.hasRaisedHand = existing.hasRaisedHand || p.hasRaisedHand
      existing.hasVideo = existing.hasVideo || p.hasVideo
      existing.hasAudio = existing.hasAudio || p.hasAudio
      existing.isScreenSharing =
        existing.isScreenSharing || p.isScreenSharing
    }
  }

  return Array.from(grouped.values()).sort(participantSort)
}

const broadcastRoomState = (meetingCode) => {
  const room = rooms[meetingCode]
  if (!room || !io) return

  io.to(meetingCode).emit("participants:update", room.participants)
  io.to(meetingCode).emit(
    "participants:grouped",
    getGroupedParticipants(room.participants)
  )
  io.to(meetingCode).emit("raisedHands:update", room.raisedHands)
  io.to(meetingCode).emit("polls:update", room.polls)
}

const removeParticipantFromRoom = (meetingCode, socketId) => {
  const room = rooms[meetingCode]
  if (!room) return

  room.participants = room.participants.filter(
    (p) => p.socketId !== socketId
  )

  room.raisedHands = room.raisedHands.filter(
    (p) => p.socketId !== socketId
  )
}

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  })

  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ meetingCode, user }) => {
      const room = ensureRoom(meetingCode)

      const duplicate = room.participants.find(
        (p) =>
          p.idNumber === user.idNumber &&
          p.sessionId === user.sessionId
      )

      if (!duplicate) {
        const sameUser = room.participants.filter(
          (p) => p.idNumber === user.idNumber
        )

        room.participants.push({
          socketId: socket.id,
          sessionId: user.sessionId,
          idNumber: user.idNumber,
          name: user.name,
          role: user.role,
          joinedAt: new Date().toISOString(),
          hasAudio: false,
          hasVideo: false,
          isSpeaking: false,
          hasRaisedHand: false,
          isScreenSharing: false,
          isPrimaryMedia: sameUser.length === 0
        })
      }

      socket.join(meetingCode)
      socket.data.meetingCode = meetingCode

      broadcastRoomState(meetingCode)

      socket.to(meetingCode).emit("webrtc:peer-joined", {
        socketId: socket.id
      })
    })

    socket.on("leaveRoom", ({ meetingCode }) => {
      removeParticipantFromRoom(meetingCode, socket.id)

      socket.leave(meetingCode)

      broadcastRoomState(meetingCode)

      socket.to(meetingCode).emit("webrtc:peer-left", {
        socketId: socket.id
      })
    })

    // 🔥 MEDIA STATE (FINAL FIX)
    socket.on("participant:mediaState", ({ meetingCode, mediaState }) => {
      const room = rooms[meetingCode]
      if (!room) return

      const participant = room.participants.find(
        (p) => p.socketId === socket.id
      )
      if (!participant) return

      participant.hasAudio = !!mediaState?.hasAudio
      participant.hasVideo = !!mediaState?.hasVideo
      participant.isScreenSharing = !!mediaState?.isScreenSharing

      broadcastRoomState(meetingCode)
    })

    socket.on("participant:speaking", ({ meetingCode, isSpeaking }) => {
      const room = rooms[meetingCode]
      if (!room) return

      const participant = room.participants.find(
        (p) => p.socketId === socket.id
      )

      if (participant) {
        participant.isSpeaking = isSpeaking
      }

      broadcastRoomState(meetingCode)
    })

    socket.on("chat:send", ({ meetingCode, message }) => {
      io.to(meetingCode).emit("chat:receive", message)
    })

    socket.on("hand:raise", ({ meetingCode, user }) => {
      const room = rooms[meetingCode]
      if (!room) return

      const participant = room.participants.find(
        (p) => p.socketId === socket.id
      )

      if (participant) {
        participant.hasRaisedHand = true
      }

      room.raisedHands.push({
        socketId: socket.id,
        idNumber: user.idNumber,
        name: user.name,
        role: user.role
      })

      broadcastRoomState(meetingCode)
    })

    socket.on("hand:lower", ({ meetingCode }) => {
      const room = rooms[meetingCode]
      if (!room) return

      room.raisedHands = room.raisedHands.filter(
        (p) => p.socketId !== socket.id
      )

      const participant = room.participants.find(
        (p) => p.socketId === socket.id
      )

      if (participant) {
        participant.hasRaisedHand = false
      }

      broadcastRoomState(meetingCode)
    })

    socket.on("poll:create", ({ meetingCode, poll }) => {
      const room = rooms[meetingCode]
      if (!room) return

      const newPoll = {
        id: `poll-${Date.now()}`,
        question: poll.question,
        options: poll.options.map((o) => ({
          text: o,
          votes: 0
        })),
        votesByUser: {}
      }

      room.polls = [newPoll]

      broadcastRoomState(meetingCode)
    })

    socket.on("poll:vote", ({ meetingCode, pollId, optionIndex, userId }) => {
      const room = rooms[meetingCode]
      if (!room) return

      const poll = room.polls.find((p) => p.id === pollId)
      if (!poll) return

      if (poll.votesByUser[userId] !== undefined) {
        poll.options[poll.votesByUser[userId]].votes--
      }

      poll.votesByUser[userId] = optionIndex
      poll.options[optionIndex].votes++

      broadcastRoomState(meetingCode)
    })

    socket.on("webrtc:offer", ({ target, offer, caller }) => {
      io.to(target).emit("webrtc:offer", { offer, caller })
    })

    socket.on("webrtc:answer", ({ target, answer, responder }) => {
      io.to(target).emit("webrtc:answer", { answer, responder })
    })

    socket.on("webrtc:ice-candidate", ({ target, candidate, from }) => {
      io.to(target).emit("webrtc:ice-candidate", { candidate, from })
    })

    socket.on("meeting:end-for-all", ({ meetingCode }) => {
      io.to(meetingCode).emit("meeting:ended")

      if (rooms[meetingCode]) {
        rooms[meetingCode] = {
          participants: [],
          raisedHands: [],
          polls: []
        }
      }
    })

    socket.on("disconnect", () => {
      Object.keys(rooms).forEach((meetingCode) => {
        removeParticipantFromRoom(meetingCode, socket.id)
        broadcastRoomState(meetingCode)

        socket.to(meetingCode).emit("webrtc:peer-left", {
          socketId: socket.id
        })
      })
    })
  })
}

module.exports = { initSocket }