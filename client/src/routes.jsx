import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import ProfilePage from "./pages/ProfilePage"
import DashboardPage from "./pages/DashboardPage"
import MeetingPage from "./pages/MeetingPage"
import { useAuth } from "./context/AuthContext"

function PrivateRoute({ children }) {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/meeting/:meetingCode"
        element={
          <PrivateRoute>
            <MeetingPage />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}