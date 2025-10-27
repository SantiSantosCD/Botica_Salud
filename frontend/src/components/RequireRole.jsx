import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'

export default function RequireRole({ roles = [], children }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.rol || !roles.includes(user.rol)) return <Navigate to="/dashboard" replace />
  return children
}
