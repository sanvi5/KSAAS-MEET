import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  DisconnectButton,
  ParticipantTile,
  ControlBar,
  useTracks,
  useParticipants
} from "@livekit/components-react"
import { Track } from "livekit-client"
import "@livekit/components-styles"

import Header from "../components/layout/Header"
import { apiRequest } from "../services/api"
import { fetchLivekitToken } from "../services/livekit"
import {
  getStageState,
  raiseHand,
  approveSpeaker,
  allowCamera
} from "../services/stage"
import { getPolls, createPoll, votePoll } from "../services/polls"
import {
  getChatMessages,
  sendChatMessage
} from "../services/chat"
import {
  forceMuteMic,
  forceCameraOff,
  removeFromStage,
  endMeetingForEveryone
} from "../services/livekitControl"
import { useAuth } from "../context/AuthContext"

function StageRoom({
  meetingCode,
  role,
  canPublish,
  canUseCamera,
  canShareScreen,
  refreshToken
}) {
  const participants = useParticipants()

  const [stageState, setStageState] = useState(null)
  const [message, setMessage] = useState("")
  const [activePanel, setActivePanel] = useState(null)
  const [menuOpenFor, setMenuOpenFor] = useState(null)

  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptionA, setPollOptionA] = useState("Yes")
  const [pollOptionB, setPollOptionB] = useState("No")
  const [polls, setPolls] = useState([])

  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState([])

  const isHostOrAdmin = role === "host" || role === "admin"

  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  )

  const screenTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  )

  const mainTrack = screenTracks[0] || cameraTracks[0] || null

  const sideTracks = cameraTracks
    .filter((trackRef) => {
      if (!mainTrack) return true
      return trackRef.participant.identity !== mainTrack.participant.identity
    })
    .slice(0, 8)

  const loadStage = async () => {
    try {
      const data = await getStageState(meetingCode)
      setStageState(data)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const loadPolls = async () => {
    try {
      const data = await getPolls(meetingCode)
      setPolls(data)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const loadChatMessages = async () => {
    try {
      const data = await getChatMessages(meetingCode)
      setChatMessages(data)
    } catch (err) {
      setMessage(err.message)
    }
  }

  useEffect(() => {
    loadStage()
    loadPolls()
    loadChatMessages()

    const timer = setInterval(() => {
      loadStage()
      loadPolls()
      loadChatMessages()
    }, 4000)

    return () => clearInterval(timer)
  }, [meetingCode])

  const togglePanel = (panel) => {
    setActivePanel((prev) => (prev === panel ? null : panel))
  }

  const handleRaiseHand = async () => {
    try {
      await raiseHand(meetingCode)
      setMessage("Hand raised. Wait for host/admin approval.")
      await loadStage()
      setActivePanel("raisedHands")
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleApproveSpeaker = async (person) => {
    try {
      await approveSpeaker(meetingCode, person)
      setMessage(`${person.name} can now use mic. Ask them to refresh permissions.`)
      await loadStage()
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleAllowCamera = async (person) => {
    try {
      await allowCamera(meetingCode, person)
      setMessage(`${person.name} can now use camera. Ask them to refresh permissions.`)
      await loadStage()
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleForceMuteMic = async (identity) => {
    try {
      const data = await forceMuteMic(meetingCode, identity)
      setMessage(data.message)
      setMenuOpenFor(null)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleForceCameraOff = async (identity) => {
    try {
      const data = await forceCameraOff(meetingCode, identity)
      setMessage(data.message)
      setMenuOpenFor(null)
      await loadStage()
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleRemoveFromStage = async (identity) => {
    try {
      const data = await removeFromStage(meetingCode, identity)
      setMessage(data.message)
      setMenuOpenFor(null)
      await loadStage()
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleEndMeetingForEveryone = async () => {
    try {
      await endMeetingForEveryone(meetingCode)
      window.location.href = "/dashboard"
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleCreatePoll = async () => {
    if (!isHostOrAdmin) return

    if (!pollQuestion.trim()) {
      setMessage("Poll question is required")
      return
    }

    if (!pollOptionA.trim() || !pollOptionB.trim()) {
      setMessage("Both poll options are required")
      return
    }

    try {
      const data = await createPoll(meetingCode, pollQuestion.trim(), [
        pollOptionA.trim(),
        pollOptionB.trim()
      ])

      setPolls(data)
      setPollQuestion("")
      setPollOptionA("Yes")
      setPollOptionB("No")
      setMessage("Poll created")
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleVotePoll = async (pollId, optionIndex) => {
    try {
      const data = await votePoll(meetingCode, pollId, optionIndex)
      setPolls(data)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleSendChat = async () => {
    if (!chatInput.trim()) return

    try {
      const data = await sendChatMessage(meetingCode, chatInput.trim())
      setChatMessages(data)
      setChatInput("")
    } catch (err) {
      setMessage(err.message)
    }
  }

  const renderPanel = () => {
    if (!activePanel) return null

    return (
      <aside
        className="meeting-sidebar visible"
        style={{
          position: "fixed",
          right: "1rem",
          bottom: "6.5rem",
          top: "5rem",
          width: "370px",
          zIndex: 30,
          overflowY: "auto"
        }}
      >
        {activePanel === "participants" && (
          <div className="side-panel drawer-panel">
            <div className="drawer-header">
              <h3>Participants</h3>
              <button className="secondary-btn" onClick={() => setActivePanel(null)}>
                Close
              </button>
            </div>

            <p>Total: {participants.length}</p>
            <p>
              Speakers: {stageState?.speakers?.length || 0}/
              {stageState?.limits?.maxMicSpeakers || 50}
            </p>
            <p>
              Camera: {stageState?.cameraAllowed?.length || 0}/
              {stageState?.limits?.maxCameraPublishers || 20}
            </p>

            {participants.map((p) => (
              <div
                className="participant-row"
                key={p.identity}
                style={{ position: "relative" }}
              >
                <img src="/defaultavatar.jpg" alt="avatar" className="mini-avatar" />

                <div className="participant-info">
                  <strong>{p.name || p.identity}</strong>
                  <p>{p.isLocal ? "You" : p.identity}</p>
                </div>

                {isHostOrAdmin && !p.isLocal && (
                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setMenuOpenFor((prev) =>
                        prev === p.identity ? null : p.identity
                      )
                    }
                  >
                    ⋮
                  </button>
                )}

                {menuOpenFor === p.identity && (
                  <div
                    style={{
                      position: "absolute",
                      right: "0.5rem",
                      top: "2.8rem",
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "0.5rem",
                      zIndex: 50,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
                      display: "grid",
                      gap: "0.4rem",
                      minWidth: "210px"
                    }}
                  >
                    <button
                      className="secondary-btn"
                      onClick={() =>
                        handleApproveSpeaker({
                          identity: p.identity,
                          name: p.name || p.identity,
                          role: "participant"
                        })
                      }
                    >
                      Allow Mic
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        handleAllowCamera({
                          identity: p.identity,
                          name: p.name || p.identity,
                          role: "participant"
                        })
                      }
                    >
                      Allow Camera
                    </button>

                    <button
                      className="danger-btn"
                      onClick={() => handleForceMuteMic(p.identity)}
                    >
                      Mute Mic Now
                    </button>

                    <button
                      className="danger-btn"
                      onClick={() => handleForceCameraOff(p.identity)}
                    >
                      Camera Off Now
                    </button>

                    <button
                      className="danger-btn"
                      onClick={() => handleRemoveFromStage(p.identity)}
                    >
                      Remove Stage Permission
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activePanel === "raisedHands" && (
          <div className="side-panel drawer-panel">
            <div className="drawer-header">
              <h3>Raised Hands</h3>
              <button className="secondary-btn" onClick={() => setActivePanel(null)}>
                Close
              </button>
            </div>

            {isHostOrAdmin ? (
              stageState?.handRequests?.length ? (
                stageState.handRequests.map((person) => (
                  <div className="participant-row" key={person.identity}>
                    <div className="participant-info">
                      <strong>{person.name}</strong>
                      <p>{person.identity}</p>
                    </div>

                    <button
                      className="secondary-btn"
                      onClick={() => handleApproveSpeaker(person)}
                    >
                      Allow Mic
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() => handleAllowCamera(person)}
                    >
                      Allow Cam
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-text">No raised hands</p>
              )
            ) : (
              <p className="empty-text">
                You raised your hand. Host/admin will see it here.
              </p>
            )}
          </div>
        )}

        {activePanel === "polls" && (
          <div className="side-panel drawer-panel">
            <div className="drawer-header">
              <h3>Polls</h3>
              <button className="secondary-btn" onClick={() => setActivePanel(null)}>
                Close
              </button>
            </div>

            {isHostOrAdmin && (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Poll question"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Option 1"
                  value={pollOptionA}
                  onChange={(e) => setPollOptionA(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Option 2"
                  value={pollOptionB}
                  onChange={(e) => setPollOptionB(e.target.value)}
                />

                <button className="primary-btn" onClick={handleCreatePoll}>
                  Create Poll
                </button>
              </div>
            )}

            {polls.length === 0 ? (
              <p className="empty-text">No polls yet</p>
            ) : (
              polls.map((poll) => (
                <div
                  key={poll.id}
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px"
                  }}
                >
                  <strong>{poll.question}</strong>

                  <div
                    style={{
                      display: "grid",
                      gap: "0.5rem",
                      marginTop: "0.75rem"
                    }}
                  >
                    {poll.options.map((option, index) => (
                      <button
                        key={`${poll.id}-${option.text}`}
                        className="secondary-btn"
                        onClick={() => handleVotePoll(poll.id, index)}
                      >
                        {option.text} ({option.votes})
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activePanel === "chat" && (
          <div className="side-panel drawer-panel">
            <div className="drawer-header">
              <h3>Chat</h3>
              <button className="secondary-btn" onClick={() => setActivePanel(null)}>
                Close
              </button>
            </div>

            <div style={{ display: "grid", gap: "0.6rem", marginBottom: "1rem" }}>
              {chatMessages.length === 0 ? (
                <p className="empty-text">No messages yet</p>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: "0.6rem",
                      background: "#f8fafc",
                      borderRadius: "10px",
                      color: "#0f172a"
                    }}
                  >
                    <strong>
                      {msg.senderName} • {msg.senderRole}
                    </strong>
                    <p style={{ margin: "0.25rem 0" }}>{msg.text}</p>
                    <small>
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString()
                        : ""}
                    </small>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="Type message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChat()
                }}
              />

              <button className="primary-btn" onClick={handleSendChat}>
                Send
              </button>
            </div>
          </div>
        )}
      </aside>
    )
  }

  return (
    <main className="meeting-layout">
      <section className="meeting-main" style={{ paddingBottom: "6rem" }}>
        <div className="meeting-banner">
          <div>
            <h2>Stage Mode</h2>
            <p>
              {canPublish
                ? "You can use mic/camera according to permission."
                : "You are audience-only. Raise hand to speak."}
            </p>
          </div>

          <span className="status-badge status-live">{role}</span>
        </div>

        {message && <p className="success-text">{message}</p>}

        <div className="video-grid video-grid-main-layout">
          <div className="video-stage-main">
            <div className="video-tile video-main-tile">
              {mainTrack ? (
                <ParticipantTile trackRef={mainTrack} />
              ) : (
                <div style={{ color: "white", padding: "2rem" }}>
                  Waiting for host/admin video or screen share...
                </div>
              )}
            </div>
          </div>

          <div className="video-stage-side">
            {sideTracks.map((trackRef) => (
              <div
                className="video-tile video-side-tile"
                key={`${trackRef.participant.identity}-${trackRef.source}`}
              >
                <ParticipantTile trackRef={trackRef} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {renderPanel()}

      <footer
        className="meeting-toolbar"
        style={{
          position: "fixed",
          left: "50%",
          bottom: "1rem",
          transform: "translateX(-50%)",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.75rem 1rem",
          borderRadius: "999px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.18)",
          background: "rgba(255,255,255,0.96)",
          maxWidth: "95vw",
          overflowX: "auto"
        }}
      >
        {canPublish && (
          <ControlBar
            controls={{
              microphone: true,
              camera: canUseCamera,
              screenShare: canShareScreen,
              leave: false,
              chat: false
            }}
          />
        )}

        {!canPublish && (
          <button className="secondary-btn" onClick={handleRaiseHand}>
            ✋ Raise
          </button>
        )}

        <button className="secondary-btn" onClick={() => togglePanel("participants")}>
          👥 People
        </button>

        <button className="secondary-btn" onClick={() => togglePanel("raisedHands")}>
          ✋ Hands
        </button>

        <button className="secondary-btn" onClick={() => togglePanel("chat")}>
          💬 Chat
        </button>

        <button className="secondary-btn" onClick={() => togglePanel("polls")}>
          📊 Polls
        </button>

        <button className="secondary-btn" onClick={refreshToken}>
          🔄 Refresh
        </button>

        <button className="secondary-btn" onClick={handleFullScreen}>
          ⛶ Fullscreen
        </button>

        {isHostOrAdmin && (
          <button className="danger-btn" onClick={handleEndMeetingForEveryone}>
            End for Everyone
          </button>
        )}

        <DisconnectButton stopTracks={true} className="danger-btn">
          Leave
        </DisconnectButton>
      </footer>

      <RoomAudioRenderer />
    </main>
  )
}

export default function MeetingPage() {
  const navigate = useNavigate()
  const { meetingCode } = useParams()
  const { displayName, idNumber } = useAuth()

  const [meeting, setMeeting] = useState(null)
  const [tokenData, setTokenData] = useState(null)
  const [roomKey, setRoomKey] = useState(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const participantName = useMemo(
    () => displayName || idNumber || "User",
    [displayName, idNumber]
  )

  const loadToken = async () => {
    const livekitData = await fetchLivekitToken(meetingCode, participantName)
    setTokenData(livekitData)
    setRoomKey((prev) => prev + 1)
  }

  useEffect(() => {
    const init = async () => {
      try {
        const joinData = await apiRequest(`/meetings/join/${meetingCode}`)
        setMeeting(joinData.meeting)
        await loadToken()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [meetingCode, participantName])

  const refreshToken = async () => {
    setLoading(true)

    try {
      await loadToken()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <Header title={meeting ? meeting.title : `KSAAS Meet • ${meetingCode}`} />

      {loading ? (
        <div style={{ padding: "2rem" }}>Connecting...</div>
      ) : error ? (
        <div style={{ padding: "2rem", color: "red" }}>{error}</div>
      ) : !tokenData ? (
        <div style={{ padding: "2rem" }}>Could not create room token</div>
      ) : (
        <LiveKitRoom
          key={roomKey}
          token={tokenData.token}
          serverUrl={tokenData.url}
          connect={true}
          video={tokenData.canPublish && tokenData.canUseCamera}
          audio={tokenData.canPublish}
          data-lk-theme="default"
          style={{ minHeight: "calc(100vh - 80px)" }}
          onDisconnected={() => navigate("/dashboard")}
        >
          <StageRoom
            meetingCode={meetingCode}
            role={tokenData.role}
            canPublish={tokenData.canPublish}
            canUseCamera={tokenData.canUseCamera}
            canShareScreen={tokenData.canShareScreen}
            refreshToken={refreshToken}
          />
        </LiveKitRoom>
      )}
    </div>
  )
}