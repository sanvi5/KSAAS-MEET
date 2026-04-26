import { useAuth } from "../../context/AuthContext"
import { useMeeting } from "../../context/MeetingContext"

export default function MeetingToolbar({
  onRaiseHand,
  onLeaveMeeting,
  onEndMeeting,
  onToggleFullScreen,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  handRaised,
  meetingStatus
}) {
  const { role } = useAuth()
  const {
    activePanel,
    setActivePanel,
    isFullScreen,
    micEnabled,
    cameraEnabled,
    screenShareEnabled
  } = useMeeting()

  const isLive = meetingStatus === "live"
  const canScreenShare = role === "host" || role === "admin"
  const canEndMeeting = role === "host"

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName)
  }

  return (
    <div className="meeting-toolbar">
      <button
        className={`toolbar-btn toolbar-round ${micEnabled ? "toolbar-active" : ""}`}
        onClick={onToggleMic}
        disabled={!isLive}
        title="Microphone"
      >
        <span className="toolbar-icon">🎤</span>
        <span className="toolbar-label">{micEnabled ? "Mic On" : "Mic Off"}</span>
      </button>

      <button
        className={`toolbar-btn toolbar-round ${cameraEnabled ? "toolbar-active" : ""}`}
        onClick={onToggleCamera}
        disabled={!isLive}
        title="Camera"
      >
        <span className="toolbar-icon">📷</span>
        <span className="toolbar-label">{cameraEnabled ? "Cam On" : "Cam Off"}</span>
      </button>

      {canScreenShare && (
        <button
          className={`toolbar-btn toolbar-round ${screenShareEnabled ? "toolbar-active" : ""}`}
          onClick={onToggleScreenShare}
          disabled={!isLive}
          title="Share Screen"
        >
          <span className="toolbar-icon">🖥️</span>
          <span className="toolbar-label">
            {screenShareEnabled ? "Stop Share" : "Share"}
          </span>
        </button>
      )}

      <button
        className={`toolbar-btn toolbar-round ${handRaised ? "toolbar-active" : ""}`}
        onClick={onRaiseHand}
        disabled={!isLive}
        title="Raise Hand"
      >
        <span className="toolbar-icon">✋</span>
        <span className="toolbar-label">
          {handRaised ? "Lower" : "Raise"}
        </span>
      </button>

      <button
        className={`toolbar-btn toolbar-round ${activePanel === "chat" ? "toolbar-active" : ""}`}
        onClick={() => togglePanel("chat")}
        disabled={!isLive}
        title="Chat"
      >
        <span className="toolbar-icon">💬</span>
        <span className="toolbar-label">Chat</span>
      </button>

      <button
        className={`toolbar-btn toolbar-round ${activePanel === "participants" ? "toolbar-active" : ""}`}
        onClick={() => togglePanel("participants")}
        disabled={!isLive}
        title="Participants"
      >
        <span className="toolbar-icon">👥</span>
        <span className="toolbar-label">People</span>
      </button>

      <button
        className={`toolbar-btn toolbar-round ${activePanel === "polls" ? "toolbar-active" : ""}`}
        onClick={() => togglePanel("polls")}
        disabled={!isLive}
        title="Polls"
      >
        <span className="toolbar-icon">📊</span>
        <span className="toolbar-label">Polls</span>
      </button>

      <button
        className={`toolbar-btn toolbar-round ${activePanel === "raisedHands" ? "toolbar-active" : ""}`}
        onClick={() => togglePanel("raisedHands")}
        disabled={!isLive}
        title="Raised Hands"
      >
        <span className="toolbar-icon">🙋</span>
        <span className="toolbar-label">Hands</span>
      </button>

      <button
        className="toolbar-btn toolbar-round"
        onClick={onToggleFullScreen}
        title="Full Screen"
      >
        <span className="toolbar-icon">⛶</span>
        <span className="toolbar-label">
          {isFullScreen ? "Exit" : "Full"}
        </span>
      </button>

      <button className="secondary-btn toolbar-pill" onClick={onLeaveMeeting}>
        Leave
      </button>

      {canEndMeeting && isLive && (
        <button className="danger-btn toolbar-pill" onClick={onEndMeeting}>
          End for All
        </button>
      )}
    </div>
  )
}