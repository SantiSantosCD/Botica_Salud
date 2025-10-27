import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'

export default function Sidebar(){
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'

  return (
    <nav className="menu">
      <NavLink to="/dashboard" className={({isActive})=> isActive ? 'active' : ''}>📊 Dashboard</NavLink>
      <NavLink to="/productos" className={({isActive})=> isActive ? 'active' : ''}>
        📦 Productos {user?.rol === 'empleado' && <span className="badge warn" style={{marginLeft:8}}>solo lectura</span>}
      </NavLink>
      <NavLink to="/ventas" className={({isActive})=> isActive ? 'active' : ''}>🧾 Ventas</NavLink>
      <NavLink to="/clientes" className={({isActive})=> isActive ? 'active' : ''}>🧾 Boletas</NavLink>

      {isAdmin && (
        <NavLink to="/usuarios" className={({isActive})=> isActive ? 'active' : ''}>🛡️ Usuarios</NavLink>
      )}
    </nav>
  )
}
