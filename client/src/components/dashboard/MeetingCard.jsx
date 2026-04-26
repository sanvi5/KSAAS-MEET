import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function MeetingCard({ meeting, onStart, onEnd, onExport }) {
  const navigate = useNavigate()
  const { role } = useAuth()

  const openMeeting = () => {
    navigate(`/meeting/${meeting.meetingCode}`)
  }

  const canExport = role === "host" || role === "admin"
  const canStart = role === "host" && meeting.status === "scheduled"
  const canEnd = role === "host" && meeting.status === "live"

  return (
    <div className="meeting-card">
      <div className="meeting-card-top">
        <div>
          <h3>{meeting.title}</h3>
          <p>{meeting.meetingCode}</p>
        </div>

        <span className={`status-badge status-${meeting.status}`}>
          {meeting.status}
        </span>
      </div>

      <div className="meeting-card-meta">
        <span>Participant cap: {meeting.participantCap || "N/A"}</span>
        <span>Chat: {meeting.chatEnabled ? "On" : "Off"}</span>
        <span>Raise hand: {meeting.raiseHandEnabled ? "On" : "Off"}</span>
        <span>Polls: {meeting.pollEnabled ? "On" : "Off"}</span>
      </div>

      <div className="meeting-card-actions">
        <button className="secondary-btn" onClick={openMeeting}>
          Open Meeting
        </button>

        {canStart && (
          <button className="primary-btn" onClick={() => onStart(meeting._id)}>
            Start Meeting
          </button>
        )}

        {canEnd && (
          <button className="danger-btn" onClick={() => onEnd(meeting._id)}>
            End Meeting
          </button>
        )}

        {canExport && meeting.status === "ended" && (
          <button
            className="secondary-btn export-link-btn"
            onClick={() => onExport(meeting._id, meeting.meetingCode)}
          >
            Export Attendance
          </button>
        )}
      </div>
    </div>
  )
}