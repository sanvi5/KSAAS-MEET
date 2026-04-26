import { apiRequest } from "./api"

export async function getStageState(roomName) {
  return await apiRequest(`/stage/${roomName}`)
}

export async function raiseHand(roomName) {
  return await apiRequest(`/stage/${roomName}/raise-hand`, {
    method: "POST"
  })
}

export async function approveSpeaker(roomName, person) {
  return await apiRequest(`/stage/${roomName}/approve-speaker`, {
    method: "POST",
    body: JSON.stringify(person)
  })
}

export async function allowCamera(roomName, person) {
  return await apiRequest(`/stage/${roomName}/allow-camera`, {
    method: "POST",
    body: JSON.stringify(person)
  })
}

export async function demoteSpeaker(roomName, identity) {
  return await apiRequest(`/stage/${roomName}/speaker/${identity}`, {
    method: "DELETE"
  })
}