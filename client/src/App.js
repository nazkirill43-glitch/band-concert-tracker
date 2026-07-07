import { Route, Routes, Navigate } from "react-router-dom"
import Dashboard from "./components/Dashboard"
import Signup from "./components/Signup"
import Login from "./components/Login"

function App() {
  const user = localStorage.getItem("token")

  return (
    <Routes>
      {user && <Route path="/" element={<Dashboard />} />}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate replace to="/login" />} />
    </Routes>
  )
}

export default App
