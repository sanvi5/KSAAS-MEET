const rooms = {}

function ensureRoom(roomName) {
  if (!rooms[roomName]) {
    rooms[roomName] = {
      messages: []
    }
  }

  return rooms[roomName]
}

function getMessages(roomName) {
  return ensureRoom(roomName).messages
}

function addMessage(roomName, message) {
  const room = ensureRoom(roomName)

  const newMessage = {
    id: `msg-${Date.now()}`,
    senderId: message.senderId,
    senderName: message.senderName,
    senderRole: message.senderRole,
    text: message.text,
    createdAt: new Date().toISOString()
  }

  room.messages.push(newMessage)

  if (room.messages.length > 300) {
    room.messages = room.messages.slice(-300)
  }

  return room.messages
}

module.exports = {
  getMessages,
  addMessage
}