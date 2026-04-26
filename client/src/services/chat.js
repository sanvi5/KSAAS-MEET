import { apiRequest } from "./api"

export async function getChatMessages(roomName) {
  return await apiRequest(`/chat/${roomName}`)
}

export async function sendChatMessage(roomName, text) {
  return await apiRequest(`/chat/${roomName}`, {
    method: "POST",
    body: JSON.stringify({ text })
  })
}