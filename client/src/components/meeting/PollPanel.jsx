import { useState } from "react"
import socket from "../../services/socket"
import { useAuth } from "../../context/AuthContext"
import { useMeeting } from "../../context/MeetingContext"

export default function PollPanel({ meetingCode }) {
  const { role, idNumber } = useAuth()
  const { polls = [] } = useMeeting()

  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])

  const canCreatePoll = role === "host" || role === "admin"

  const updateOption = (index, value) => {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  const addOption = () => {
    setOptions((prev) => [...prev, ""])
  }

  const createPoll = () => {
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean)

    if (!question.trim() || cleanOptions.length < 2) return

    socket.emit("poll:create", {
      meetingCode,
      poll: {
        question: question.trim(),
        options: cleanOptions
      }
    })

    setQuestion("")
    setOptions(["", ""])
  }

  const vote = (pollId, optionIndex) => {
    socket.emit("poll:vote", {
      meetingCode,
      pollId,
      optionIndex,
      userId: idNumber
    })
  }

  return (
    <div className="side-panel drawer-panel">
      <div className="drawer-header">
        <h3>Polls</h3>
      </div>

      {canCreatePoll && (
        <div className="poll-create">
          <input
            className="chat-input"
            placeholder="Enter question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          {options.map((opt, index) => (
            <input
              key={index}
              className="chat-input"
              placeholder={`Option ${index + 1}`}
              value={opt}
              onChange={(e) => updateOption(index, e.target.value)}
            />
          ))}

          <button className="secondary-btn" onClick={addOption}>
            Add Option
          </button>

          <button className="primary-btn" onClick={createPoll}>
            Create Poll
          </button>
        </div>
      )}

      {polls.length === 0 ? (
        <p className="empty-text">No active polls</p>
      ) : (
        polls.map((poll) => (
          <div key={poll.id} className="poll-card">
            <strong>{poll.question}</strong>

            {poll.options.map((opt, index) => (
              <button
                key={index}
                className="poll-option-btn"
                onClick={() => vote(poll.id, index)}
              >
                {opt.text} ({opt.votes})
              </button>
            ))}
          </div>
        ))
      )}
    </div>
  )
}