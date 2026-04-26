import { apiRequest } from "./api"

export async function forceMuteMic(roomName, identity) {
  return await apiRequest(`/livekit-control/${roomName}/${identity}/mute-mic`, {
    method: "PATCH"
  })
}

export async function forceCameraOff(roomName, identity) {
  return await apiRequest(`/livekit-control/${roomName}/${identity}/camera-off`, {
    method: "PATCH"
  })
}

export async function removeFromStage(roomName, identity) {
  return await apiRequest(`/livekit-control/${roomName}/${identity}/stage`, {
    method: "DELETE"
  })
}

export async function endMeetingForEveryone(roomName) {
  return await apiRequest(`/livekit-control/${roomName}/end`, {
    method: "DELETE"
  })
}