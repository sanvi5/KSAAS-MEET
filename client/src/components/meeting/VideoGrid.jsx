import { useAuth } from "../../context/AuthContext"
import { useMeeting } from "../../context/MeetingContext"
import VideoTile from "./VideoTile"

export default function VideoGrid() {
  const { displayName, role, idNumber } = useAuth()

  const {
    groupedParticipants = [],
    localStream,
    cameraEnabled,
    screenShareEnabled,
    remoteStreams = {},
    pinnedUser
  } = useMeeting()

  const getPrimaryStream = (person) => {
    const session =
      person.sessions?.find((s) => s.isPrimaryMedia) ||
      person.sessions?.[0]

    return session ? remoteStreams[session.socketId] : null
  }

  // 🔥 SELF TILE
  const selfTile = {
    id: "self",
    name: displayName || idNumber,
    role,
    stream: localStream,
    hasVideo: !!localStream && (cameraEnabled || screenShareEnabled),
    isLocal: true,
    isScreenShare: screenShareEnabled,
    isSpeaking: false,
    deviceCount: 1
  }

  // 🔥 REMOTE TILES
  const remoteTiles = groupedParticipants
    .filter((p) => p.idNumber !== idNumber)
    .map((p) => ({
      id: p.idNumber,
      name: p.name,
      role: p.role,
      stream: getPrimaryStream(p),
      hasVideo: !!getPrimaryStream(p),
      isLocal: false,
      isScreenShare: p.isScreenSharing || false,
      isSpeaking: p.isSpeaking || false,
      deviceCount: p.deviceCount || 1
    }))

  const rolePriority = { host: 3, admin: 2, participant: 1 }

  // 🔥 SORT BASE (role + share + speaking)
  const sorted = [...remoteTiles].sort((a, b) => {
    if (b.isScreenShare !== a.isScreenShare) {
      return Number(b.isScreenShare) - Number(a.isScreenShare)
    }

    if ((rolePriority[b.role] || 0) !== (rolePriority[a.role] || 0)) {
      return (rolePriority[b.role] || 0) - (rolePriority[a.role] || 0)
    }

    if (b.isSpeaking !== a.isSpeaking) {
      return Number(b.isSpeaking) - Number(a.isSpeaking)
    }

    return 0
  })

  // 🔥 FINAL TILE ORDER
  let tiles = [selfTile, ...sorted]

  // 1️⃣ PINNED USER
  if (pinnedUser) {
    const pinnedIndex = tiles.findIndex((t) => t.id === pinnedUser)
    if (pinnedIndex > 0) {
      const [pinnedTile] = tiles.splice(pinnedIndex, 1)
      tiles.unshift(pinnedTile)
    }
  }

  // 2️⃣ SCREEN SHARE
  else {
    const shareIndex = tiles.findIndex((t) => t.isScreenShare)
    if (shareIndex > 0) {
      const [shareTile] = tiles.splice(shareIndex, 1)
      tiles.unshift(shareTile)
    }

    // 3️⃣ SPEAKER
    else {
      const speakingIndex = tiles.findIndex((t) => t.isSpeaking)
      if (speakingIndex > 0) {
        const [speakerTile] = tiles.splice(speakingIndex, 1)
        tiles.unshift(speakerTile)
      }
    }
  }

  // LIMIT
  tiles = tiles.slice(0, 9)

  const mainTile = tiles[0]
  const sideTiles = tiles.slice(1)

  return (
    <div className="video-grid video-grid-main-layout">
      <div className="video-stage-main">
        {mainTile && (
          <VideoTile {...mainTile} isMainStage={true} />
        )}
      </div>

      <div className="video-stage-side">
        {sideTiles.map((t) => (
          <VideoTile key={t.id} {...t} isMainStage={false} />
        ))}
      </div>
    </div>
  )
}