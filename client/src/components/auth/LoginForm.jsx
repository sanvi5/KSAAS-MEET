import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser } from "../../services/auth"
import { useAuth } from "../../context/AuthContext"

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [idNumber, setIdNumber] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    setError("")
    setLoading(true)

    try {
      const data = await loginUser(idNumber.trim(), password.trim())

      login(data)
      navigate("/profile")
    } catch (err) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <img src="/logo.jpg" alt="KSAAS Meet Logo" className="auth-logo" />
      <h2>Login to KSAAS Meet</h2>
      <p className="auth-subtext">Use your official ID number and password</p>

      <label>ID Number</label>
      <input
        type="text"
        value={idNumber}
        onChange={(e) => setIdNumber(e.target.value)}
        placeholder="Enter ID number"
        required
      />

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        required
      />

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  )
}