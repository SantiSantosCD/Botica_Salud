import { useEffect, useMemo, useState } from 'react'
import api from '@/services/api.js'
import { useAuth } from '@/context/AuthContext.jsx'

export default function Products(){
  const { user } = useAuth()
  const isEmpleado = user?.rol === 'empleado'

  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ id:null, nombre:'', descripcion:'', precio:'', stock:'', categoria:'', fecha_vencimiento:'' })

  async function fetchList(){
    setLoading(true)
    try{
      const { data } = await api.get('/productos', { params: { search: q || undefined } })
      setList(Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []))
    }catch(err){
      setError(err?.response?.data?.message || err.message)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchList() }, [])

  const filtered = useMemo(()=>{
    const s = (q||'').toLowerCase()
    return list.filter(p => (p.nombre||'').toLowerCase().includes(s) || (p.categoria||'').toLowerCase().includes(s))
  }, [list, q])

  function startCreate(){
    if(isEmpleado){ alert('Solo lectura para empleados'); return }
    setForm({id:null, nombre:'', descripcion:'', precio:'', stock:'', categoria:'', fecha_vencimiento:''})
  }
  function startEdit(p){
    if(isEmpleado){ alert('Solo lectura para empleados'); return }
    setForm({
      id:p.id, nombre:p.nombre||'', descripcion:p.descripcion||'',
      precio:p.precio||'', stock:p.stock||'', categoria:p.categoria||'',
      fecha_vencimiento:p.fecha_vencimiento ? String(p.fecha_vencimiento).slice(0,10) : ''
    })
  }

  async function save(e){
    e.preventDefault()
    if(isEmpleado){ alert('Solo lectura para empleados'); return }
    const payload = {
      nombre: form.nombre, descripcion: form.descripcion, categoria: form.categoria,
      precio: Number(form.precio), stock: Number(form.stock),
      fecha_vencimiento: form.fecha_vencimiento || null
    }
    try{
      if(form.id){
        await api.put(`/productos/${form.id}`, payload)
      }else{
        await api.post(`/productos`, payload)
      }
      await fetchList()
      startCreate()
      alert('Guardado ✅')
    }catch(err){
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }
  }

  async function remove(id){
    if(isEmpleado){ alert('Solo lectura para empleados'); return }
    if(!confirm('¿Eliminar producto?')) return
    try{
      await api.delete(`/productos/${id}`)
      await fetchList()
    }catch(err){
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }
  }

  return (
    <div className="grid" style={{gap:16}}>
      <div className="card">
        <div className="searchbar">
          <input placeholder="Buscar por nombre o categoría…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <button className="ghost" onClick={fetchList}>Actualizar</button>
          <div style={{marginLeft:'auto'}}>
            <button className="primary" onClick={startCreate} disabled={isEmpleado}>+ Nuevo producto</button>
          </div>
        </div>
        {isEmpleado && <div className="badge warn" style={{marginTop:8}}>Rol empleado: solo lectura</div>}
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3 style={{marginTop:0}}>Lista</h3>
          {loading ? 'Cargando…' : error ? ('Error: '+error) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Vence</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p=>(
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td>S/. {Number(p.precio||0).toFixed(2)}</td>
                    <td>
                      {p.stock} {' '}
                      {p.stock <= 10 ? <span className="badge warn">bajo</span> : <span className="badge ok">ok</span>}
                    </td>
                    <td>{p.fecha_vencimiento ? String(p.fecha_vencimiento).slice(0,10) : '-'}</td>
                    <td className="actions">
                      <button onClick={()=>startEdit(p)} disabled={isEmpleado}>Editar</button>
                      <button onClick={()=>remove(p.id)} disabled={isEmpleado} style={{borderColor:'#70313c', background:'#2a0f15'}}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>{form.id ? 'Editar producto' : 'Nuevo producto'}</h3>
          <form className="grid" style={{gap:12}} onSubmit={save}>
            <input required placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} disabled={isEmpleado}/>
            <input placeholder="Descripción" value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} disabled={isEmpleado}/>
            <div className="grid cols-2">
              <input required type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={e=>setForm({...form, precio:e.target.value})} disabled={isEmpleado}/>
              <input required type="number" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} disabled={isEmpleado}/>
            </div>
            <div className="grid cols-2">
              <input placeholder="Categoría" value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} disabled={isEmpleado}/>
              <input type="date" placeholder="Fecha vencimiento" value={form.fecha_vencimiento} onChange={e=>setForm({...form, fecha_vencimiento:e.target.value})} disabled={isEmpleado}/>
            </div>
            <div className="actions">
              <button className="primary" type="submit" disabled={isEmpleado}>Guardar</button>
              <button type="button" className="ghost" onClick={startCreate}>Limpiar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
