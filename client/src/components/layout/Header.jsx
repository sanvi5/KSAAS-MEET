import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Header({ title = "KSAAS Meet" }) {
  const navigate = useNavigate()
  const { role, idNumber, displayName, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <img src="/logo.jpg" alt="KSAAS Meet Logo" className="header-logo" />
        <div>
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">Secure official meeting platform</p>
        </div>
      </div>

      <div className="header-right">
        <div className="header-user">
          <span>{displayName || "User"}</span>
          <small>
            {role} • {idNumber}
          </small>
        </div>
        <button className="secondary-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}