import { apiRequest } from "./api"

export async function getPolls(roomName) {
  return await apiRequest(`/polls/${roomName}`)
}

export async function createPoll(roomName, question, options) {
  return await apiRequest(`/polls/${roomName}`, {
    method: "POST",
    body: JSON.stringify({
      question,
      options
    })
  })
}

export async function votePoll(roomName, pollId, optionIndex) {
  return await apiRequest(`/polls/${roomName}/${pollId}/vote`, {
    method: "POST",
    body: JSON.stringify({
      optionIndex
    })
  })
}