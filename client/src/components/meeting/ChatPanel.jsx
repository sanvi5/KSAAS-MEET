import { useState } from "react"
import socket from "../../services/socket"
import { useAuth } from "../../context/AuthContext"
import { useMeeting } from "../../context/MeetingContext"

export default function ChatPanel({ meetingCode }) {
  const { displayName, idNumber } = useAuth()
  const { messages = [], addMessage } = useMeeting()
  const [text, setText] = useState("")

  const sendMessage = () => {
    const cleanText = text.trim()
    if (!cleanText) return

    const message = {
      name: displayName || idNumber || "User",
      text: cleanText,
      createdAt: new Date().toISOString()
    }

    socket.emit("chat:send", { meetingCode, message })
    addMessage(message)
    setText("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="side-panel drawer-panel">
      <div className="drawer-header">
        <h3>Meeting Chat</h3>
      </div>

      <div className="chat-box">
        {messages.length === 0 ? (
          <p className="empty-text">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="chat-message-card">
              <strong>{msg.name}</strong>
              <p>{msg.text}</p>
              <small>
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </small>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button className="primary-btn" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  )
}