import { useEffect, useMemo, useState } from 'react'
import api from '@/services/api.js'
import { useAuth } from '@/context/AuthContext.jsx'

export default function Users(){
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  const [form, setForm] = useState({
    nombre:'', username:'', email:'', password:'', rol:'empleado'
  })
  const [creating, setCreating] = useState(false)
  const [changingId, setChangingId] = useState(null)

  async function fetchUsers(){
    setLoading(true); setError('')
    try{
      const { data } = await api.get('/usuarios')
      setList(Array.isArray(data) ? data : [])
    }catch(err){
      setError(err?.response?.data?.message || err.message)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchUsers() }, [])

  const filtered = useMemo(()=>{
    const s = (q||'').toLowerCase()
    return list.filter(u =>
      (u.nombre||'').toLowerCase().includes(s) ||
      (u.username||'').toLowerCase().includes(s) ||
      (u.email||'').toLowerCase().includes(s) ||
      (u.rol||'').toLowerCase().includes(s)
    )
  }, [list, q])

  function clearForm(){
    setForm({ nombre:'', username:'', email:'', password:'', rol:'empleado' })
  }

  async function createUser(e){
    e.preventDefault()
    setCreating(true)
    try{
      if(!form.nombre || !form.username || !form.email || !form.password){
        alert('Completa nombre, usuario, email y contraseña'); return
      }
      await api.post('/usuarios', {
        nombre: form.nombre,
        username: form.username,
        email: form.email,
        password: form.password,
        rol: form.rol
      })
      clearForm()
      await fetchUsers()
      alert('Usuario creado ✅')
    }catch(err){
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }finally{
      setCreating(false)
    }
  }

  async function changeRole(id, rol){
    setChangingId(id)
    try{
      await api.put(`/usuarios/${id}/rol`, { rol })
      const copy = list.map(u => u.id === id ? {...u, rol} : u)
      setList(copy)
    }catch(err){
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }finally{
      setChangingId(null)
    }
  }

  const isAdmin = user?.rol === 'admin'

  return (
    <div className="grid" style={{gap:16}}>
      <div className="card">
        <div className="searchbar">
          <input placeholder="Buscar por nombre, usuario, email o rol…" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="ghost" onClick={fetchUsers}>Actualizar</button>
          <div style={{marginLeft:'auto'}}>
            {isAdmin
              ? <span className="badge ok">Rol: administrador</span>
              : <span className="badge warn">Necesitas admin para crear/editar</span>
            }
          </div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3 style={{marginTop:0}}>Usuarios</h3>
          {loading ? 'Cargando…' : error ? ('Error: ' + error) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Usuario</th><th>Email</th><th>Rol</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u=>(
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.rol}
                        onChange={(e)=>changeRole(u.id, e.target.value)}
                        disabled={!isAdmin || changingId === u.id}
                      >
                        <option value="admin">administrador</option>
                        <option value="empleado">empleado</option>
                      </select>
                    </td>
                    <td style={{textAlign:'right'}}>
                      {changingId === u.id ? 'Guardando…' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>Crear nuevo usuario</h3>
          <form className="grid" style={{gap:12}} onSubmit={createUser}>
            <input placeholder="Nombre completo" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} disabled={!isAdmin} />
            <div className="grid cols-2">
              <input placeholder="Usuario" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} disabled={!isAdmin} />
              <select value={form.rol} onChange={e=>setForm({...form, rol:e.target.value})} disabled={!isAdmin}>
                <option value="empleado">empleado</option>
                <option value="admin">administrador</option>
              </select>
            </div>
            <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} disabled={!isAdmin} />
            <input type="password" placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} disabled={!isAdmin} />
            <div className="actions">
              <button className="primary" type="submit" disabled={!isAdmin || creating}>{creating ? 'Creando…' : 'Crear usuario'}</button>
              <button type="button" className="ghost" onClick={clearForm} disabled={!isAdmin}>Limpiar</button>
            </div>
          </form>
          {!isAdmin && <div className="badge warn" style={{marginTop:8}}>Inicia sesión como administrador para crear usuarios</div>}
        </div>
      </div>
    </div>
  )
}
