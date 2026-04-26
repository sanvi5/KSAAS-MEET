import { useEffect, useState } from "react"
import Header from "../components/layout/Header"
import MeetingCard from "../components/dashboard/MeetingCard"
import { apiRequest } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function DashboardPage() {
  const { role } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [title, setTitle] = useState("")
  const [adminIds, setAdminIds] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchMeetings = async () => {
    try {
      const data = await apiRequest("/meetings")
      setMeetings(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const createMeeting = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const adminIdNumbers = adminIds
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      await apiRequest("/meetings", {
        method: "POST",
        body: JSON.stringify({
          title,
          adminIdNumbers
        })
      })

      setTitle("")
      setAdminIds("")
      setSuccess("Meeting created successfully")
      fetchMeetings()
    } catch (err) {
      setError(err.message)
    }
  }

  const startMeeting = async (meetingId) => {
    try {
      setError("")
      setSuccess("")

      await apiRequest(`/meetings/${meetingId}/start`, {
        method: "PATCH"
      })

      setSuccess("Meeting started")
      fetchMeetings()
    } catch (err) {
      setError(err.message)
    }
  }

  const endMeeting = async (meetingId) => {
    try {
      setError("")
      setSuccess("")

      await apiRequest(`/meetings/${meetingId}/end`, {
        method: "PATCH"
      })

      setSuccess("Meeting ended")
      fetchMeetings()
    } catch (err) {
      setError(err.message)
    }
  }

  const exportAttendance = async (meetingId, meetingCode) => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"}/export/attendance/${meetingId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Failed to export attendance")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${meetingCode}_attendance.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page-shell">
      <Header title="KSAAS Meet Dashboard" />

      <main className="dashboard-layout">
        {role === "host" && (
          <form className="create-meeting-card" onSubmit={createMeeting}>
            <h2>Create New Meeting</h2>

            <input
              type="text"
              placeholder="Meeting title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="Admin ID numbers separated by commas"
              value={adminIds}
              onChange={(e) => setAdminIds(e.target.value)}
            />

            <button className="primary-btn" type="submit">
              Create Meeting
            </button>
          </form>
        )}

        <section className="meeting-list">
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting._id}
              meeting={meeting}
              onStart={startMeeting}
              onEnd={endMeeting}
              onExport={exportAttendance}
            />
          ))}
        </section>
      </main>
    </div>
  )
}