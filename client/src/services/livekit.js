import { apiRequest } from "./api"

export async function fetchLivekitToken(roomName, participantName) {
  return await apiRequest("/livekit/token", {
    method: "POST",
    body: JSON.stringify({
      roomName,
      participantName
    })
  })
}