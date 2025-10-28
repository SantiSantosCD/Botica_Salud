import { useState } from 'react'
import { useAuth } from '@/context/AuthContext.jsx'

export default function Login(){
  const { login, loading, error } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    const ok = await login({ username: username || undefined, email: email || undefined, password })
    if(ok) window.location.href = '/dashboard'
  }

  return (
    <div style={{display:'grid', placeItems:'center', height:'100%', padding:16}}>
      <div className="card" style={{width:380, maxWidth:'94%'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
          <span style={{fontSize:24}}>💊</span>
          <h2 style={{margin:0}}>Iniciar</h2>
        </div>
        <p style={{opacity:.8, marginTop:0}}>Usa tus credenciales de empleado</p>
        <form onSubmit={handleSubmit} className="grid" style={{gap:12}}>
          <input placeholder="Usuario (opcional)" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input placeholder="Email (opcional)" value={email} onChange={(e)=>setEmail(e.target.value)} type="email" />
          <input placeholder="Contraseña" value={password} onChange={(e)=>setPassword(e.target.value)} type="password" />
          {error && <div className="badge danger">{error}</div>}
          <button className="primary" disabled={loading}>{loading ? 'Ingresando…' : 'Entrar'}</button>
        </form>
        <div style={{marginTop:12, fontSize:12, opacity:.7}}>Se envía POST a <code>/auth/login</code> del backend configurado.</div>
      </div>
    </div>
  )
}
