import { createContext, useContext, useMemo, useState } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [role, setRole] = useState(localStorage.getItem("role") || "")
  const [idNumber, setIdNumber] = useState(localStorage.getItem("idNumber") || "")
  const [displayName, setDisplayName] = useState(localStorage.getItem("displayName") || "")

  const login = ({ token, role, idNumber }) => {
    localStorage.setItem("token", token)
    localStorage.setItem("role", role)
    localStorage.setItem("idNumber", idNumber)

    setToken(token)
    setRole(role)
    setIdNumber(idNumber)
  }

  const saveProfile = (name) => {
    localStorage.setItem("displayName", name)
    setDisplayName(name)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("idNumber")
    localStorage.removeItem("displayName")

    setToken("")
    setRole("")
    setIdNumber("")
    setDisplayName("")
  }

  const value = useMemo(
    () => ({
      token,
      role,
      idNumber,
      displayName,
      login,
      saveProfile,
      logout
    }),
    [token, role, idNumber, displayName]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}