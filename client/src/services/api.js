const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token")

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      ...options,
      signal: controller.signal
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config)

    const contentType = response.headers.get("content-type") || ""

    if (!response.ok) {
      const errorText = contentType.includes("application/json")
        ? await response.json()
        : await response.text()

      throw new Error(errorText.message || "Request failed")
    }

    if (contentType.includes("application/json")) {
      return await response.json()
    }

    return await response.text()
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Check if backend is running.")
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}