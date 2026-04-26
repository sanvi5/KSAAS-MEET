import { createContext, useContext, useMemo, useState } from "react"

const MeetingContext = createContext(null)

export function MeetingProvider({ children }) {
  const [participants, setParticipants] = useState([])
  const [groupedParticipants, setGroupedParticipants] = useState([])
  const [raisedHands, setRaisedHands] = useState([])
  const [messages, setMessages] = useState([])
  const [notifications, setNotifications] = useState([])
  const [polls, setPolls] = useState([])

  const [activePanel, setActivePanel] = useState(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({})
  const [peerConnections, setPeerConnections] = useState({})

  const [micEnabled, setMicEnabled] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [screenShareEnabled, setScreenShareEnabled] = useState(false)
  const [recordingEnabled, setRecordingEnabled] = useState(false)

  const [meetingStatus, setMeetingStatus] = useState("idle")
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingCode, setMeetingCode] = useState("")
  const [joinStatus, setJoinStatus] = useState("")

  const [handRaised, setHandRaised] = useState(false)
  const [pinnedUser, setPinnedUser] = useState(null)

  const [deviceWarnings, setDeviceWarnings] = useState([])
  const [exportReady, setExportReady] = useState(false)

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const addNotification = (notification) => {
    setNotifications((prev) => [...prev, notification])

    setTimeout(() => {
      setNotifications((prev) => prev.slice(1))
    }, 3000)
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const addDeviceWarning = (warning) => {
    setDeviceWarnings((prev) => [...prev, warning])
  }

  const clearDeviceWarnings = () => {
    setDeviceWarnings([])
  }

  const clearRealtimeState = () => {
    setParticipants([])
    setGroupedParticipants([])
    setRaisedHands([])
    setMessages([])
    setNotifications([])
    setPolls([])
    setPeerConnections({})
    setRemoteStreams({})
  }

  const clearMediaState = () => {
    setLocalStream(null)
    setMicEnabled(false)
    setCameraEnabled(false)
    setScreenShareEnabled(false)
    setRecordingEnabled(false)
  }

  const clearMeetingMeta = () => {
    setMeetingStatus("idle")
    setMeetingTitle("")
    setMeetingCode("")
    setJoinStatus("")
    setHandRaised(false)
    setPinnedUser(null)
    setExportReady(false)
    setActivePanel(null)
    setIsFullScreen(false)
  }

  const resetMeetingState = () => {
    clearRealtimeState()
    clearMediaState()
    clearMeetingMeta()
    clearDeviceWarnings()
  }

  const value = useMemo(
    () => ({
      participants,
      setParticipants,
      groupedParticipants,
      setGroupedParticipants,
      raisedHands,
      setRaisedHands,
      messages,
      setMessages,
      addMessage,
      clearMessages,
      notifications,
      setNotifications,
      addNotification,
      clearNotifications,
      polls,
      setPolls,
      activePanel,
      setActivePanel,
      isFullScreen,
      setIsFullScreen,
      localStream,
      setLocalStream,
      remoteStreams,
      setRemoteStreams,
      peerConnections,
      setPeerConnections,
      micEnabled,
      setMicEnabled,
      cameraEnabled,
      setCameraEnabled,
      screenShareEnabled,
      setScreenShareEnabled,
      recordingEnabled,
      setRecordingEnabled,
      meetingStatus,
      setMeetingStatus,
      meetingTitle,
      setMeetingTitle,
      meetingCode,
      setMeetingCode,
      joinStatus,
      setJoinStatus,
      handRaised,
      setHandRaised,
      pinnedUser,
      setPinnedUser,
      deviceWarnings,
      setDeviceWarnings,
      addDeviceWarning,
      clearDeviceWarnings,
      exportReady,
      setExportReady,
      clearRealtimeState,
      clearMediaState,
      clearMeetingMeta,
      resetMeetingState
    }),
    [
      participants,
      groupedParticipants,
      raisedHands,
      messages,
      notifications,
      polls,
      activePanel,
      isFullScreen,
      localStream,
      remoteStreams,
      peerConnections,
      micEnabled,
      cameraEnabled,
      screenShareEnabled,
      recordingEnabled,
      meetingStatus,
      meetingTitle,
      meetingCode,
      joinStatus,
      handRaised,
      pinnedUser,
      deviceWarnings,
      exportReady
    ]
  )

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  )
}

export function useMeeting() {
  const context = useContext(MeetingContext)

  if (!context) {
    throw new Error("useMeeting must be used inside MeetingProvider")
  }

  return context
}