const rooms = {}

function ensureRoom(roomName) {
  if (!rooms[roomName]) {
    rooms[roomName] = {
      polls: []
    }
  }

  return rooms[roomName]
}

function getPolls(roomName) {
  const room = ensureRoom(roomName)
  return room.polls
}

function createPoll(roomName, question, options, createdBy) {
  const room = ensureRoom(roomName)

  const poll = {
    id: `poll-${Date.now()}`,
    question,
    options: options.map((text) => ({
      text,
      votes: 0
    })),
    votesByUser: {},
    createdBy,
    createdAt: new Date().toISOString()
  }

  room.polls.unshift(poll)

  return room.polls
}

function votePoll(roomName, pollId, optionIndex, userId) {
  const room = ensureRoom(roomName)

  const poll = room.polls.find((p) => p.id === pollId)

  if (!poll) {
    throw new Error("Poll not found")
  }

  if (!poll.options[optionIndex]) {
    throw new Error("Invalid option")
  }

  const previousVote = poll.votesByUser[userId]

  if (previousVote !== undefined && poll.options[previousVote]) {
    poll.options[previousVote].votes -= 1
  }

  poll.votesByUser[userId] = optionIndex
  poll.options[optionIndex].votes += 1

  return room.polls
}

function clearPollRoom(roomName) {
  delete rooms[roomName]
}

module.exports = {
  getPolls,
  createPoll,
  votePoll,
  clearPollRoom
}