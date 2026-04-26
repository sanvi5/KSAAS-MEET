import { useMeeting } from "../../context/MeetingContext"

export default function ParticipantList() {
  const { groupedParticipants = [] } = useMeeting()

  return (
    <div className="side-panel drawer-panel">
      <div className="drawer-header">
        <h3>Participants ({groupedParticipants.length})</h3>
      </div>

      {groupedParticipants.length === 0 ? (
        <p className="empty-text">No participants visible yet</p>
      ) : (
        groupedParticipants.map((person, index) => (
          <div key={index} className="participant-row">
            <img
              src="/defaultavatar.jpg"
              alt="avatar"
              className="mini-avatar"
            />

            <div className="participant-info">
              <strong>
                {person.name}
                {person.deviceCount > 1 ? ` (${person.deviceCount} devices)` : ""}
              </strong>

              <p>
                {person.role}
                {person.isPrimaryMedia ? " • primary device" : ""}
                {person.isSpeaking ? " • speaking" : ""}
                {person.hasVideo ? " • video on" : ""}
                {person.hasAudio ? " • mic on" : ""}
              </p>
            </div>

            {person.hasRaisedHand && <span className="hand-badge">✋</span>}
          </div>
        ))
      )}
    </div>
  )
}