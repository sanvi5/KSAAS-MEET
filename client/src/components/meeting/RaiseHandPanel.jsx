import { useMeeting } from "../../context/MeetingContext"

export default function RaiseHandPanel() {
  const { raisedHands = [] } = useMeeting()

  return (
    <div className="side-panel drawer-panel">
      <div className="drawer-header">
        <h3>Raised Hands</h3>
      </div>

      {raisedHands.length === 0 ? (
        <p className="empty-text">No raised hands</p>
      ) : (
        <div className="raised-list">
          {raisedHands.map((person, index) => (
            <div key={index} className="raised-hand-row">
              <img
                src="/defaultavatar.jpg"
                alt="avatar"
                className="mini-avatar"
              />

              <div className="participant-info">
                <strong>{person.name}</strong>
                <p>{person.role}</p>
              </div>

              <span className="hand-badge">✋</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}