import { apiRequest } from "./api"

export async function loginUser(idNumber, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ idNumber, password })
  })
}