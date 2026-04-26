import { useEffect, useRef } from "react"
import { useMeeting } from "../../context/MeetingContext"

export default function VideoTile({
  id,
  name,
  role,
  stream,
  hasVideo,
  isLocal,
  deviceCount,
  isSpeaking,
  isScreenShare,
  isMainStage
}) {
  const videoRef = useRef(null)
  const { setPinnedUser } = useMeeting()

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const handleFullScreen = () => {
    const el = videoRef.current
    if (!el) return

    if (el.requestFullscreen) el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
  }

  return (
    <div
      className={`video-tile 
        ${isMainStage ? "video-main-tile" : ""} 
        ${isSpeaking ? "speaking-tile" : ""}
      `}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`video-element ${
            isScreenShare ? "screen-share-fit" : ""
          }`}
        />
      ) : (
        <img src="/defaultavatar.jpg" className="video-avatar" />
      )}

      {/* 🔥 TOP CONTROLS */}
      <div className="tile-controls">
        <button onClick={() => setPinnedUser(id)} title="Pin">
          📌
        </button>
        <button onClick={handleFullScreen} title="Fullscreen">
          ⛶
        </button>
      </div>

      {/* 🔥 NAME OVERLAY */}
      <div className="video-overlay">
        <span>
          {name}
          {deviceCount > 1 ? ` (${deviceCount})` : ""}
        </span>
        <small>
          {role}
          {isLocal ? " • you" : ""}
          {isScreenShare ? " • sharing" : ""}
        </small>
      </div>
    </div>
  )
}