import { useAuth } from '@/context/AuthContext.jsx'

export default function Navbar(){
  const { user, logout } = useAuth()
  return (
    <div style={{display:'flex', alignItems:'center', width:'100%'}}>
      <div style={{display:'flex', gap:12, alignItems:'center'}}>
        <strong>Panel de Gestión</strong>
      </div>
      <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:10}}>
        <span style={{opacity:.8, fontSize:14}}>{user?.nombre || user?.name || 'Usuario'}</span>
        <button className="ghost" onClick={logout}>Cerrar sesión</button>
      </div>
    </div>
  )
}
