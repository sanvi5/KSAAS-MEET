import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function ProfileForm() {
  const navigate = useNavigate()
  const { saveProfile, displayName } = useAuth()
  const [name, setName] = useState(displayName || "")

  const handleSubmit = (e) => {
    e.preventDefault()

    const cleanName = name.trim()
    if (!cleanName) return

    saveProfile(cleanName)
    navigate("/dashboard")
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <img src="/logo.jpg" alt="KSAAS Meet Logo" className="auth-logo" />
      <h2>Set Meeting Display Name</h2>
      <p className="auth-subtext">
        This name will be visible only inside the meeting
      </p>

      <label>Display Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your temporary meeting name"
        required
      />

      <button type="submit" className="primary-btn">
        Continue to Dashboard
      </button>
    </form>
  )
}