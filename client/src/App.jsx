import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { MeetingProvider } from "./context/MeetingContext"
import AppRoutes from "./routes"

export default function App() {
  return (
    <AuthProvider>
      <MeetingProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </MeetingProvider>
    </AuthProvider>
  )
}