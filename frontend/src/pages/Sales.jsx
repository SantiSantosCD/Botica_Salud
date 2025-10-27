import { useEffect, useMemo, useState } from 'react'
import api from '@/services/api.js'
import { printTicket } from '@/utils/receipt.js'

export default function Sales(){
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])
  const [dni, setDni] = useState('')
  const [clientePreview, setClientePreview] = useState({ nombre:'', email:'', telefono:'' })
  const [buscandoDni, setBuscandoDni] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ticketSize, setTicketSize] = useState('80mm') // '58mm' | '80mm' | 'A4'

  useEffect(()=>{
    (async()=>{
      const p = await api.get('/productos')
      setProducts(Array.isArray(p.data?.items) ? p.data.items : (Array.isArray(p.data) ? p.data : []))
    })()
  }, [])

  const filtered = useMemo(()=>{
    const s = (query || '').toLowerCase()
    return products.filter(x => (x.nombre||'').toLowerCase().includes(s))
  }, [products, query])

  function addToCart(p){
    setCart(prev=>{
      const i = prev.findIndex(x=>x.id===p.id)
      if(i>=0){
        const cp = [...prev]
        const nextQty = Math.min((cp[i].qty||1)+1, p.stock || 9999)
        cp[i] = { ...cp[i], qty: nextQty, max:p.stock||0 }
        return cp
      }
      return [...prev, { id:p.id, nombre:p.nombre, precio:Number(p.precio||0), qty:1, max:p.stock||0 }]
    })
  }
  function updateQty(id, qty){
    setCart(prev=> prev.map(x=>{
      if(x.id!==id) return x
      const q = Math.max(1, Number(qty)||1)
      const capped = x.max ? Math.min(q, x.max) : q
      return { ...x, qty: capped }
    }))
  }
  function removeItem(id){ setCart(prev=> prev.filter(x=> x.id!==id)) }
  const total = cart.reduce((s,x)=> s + x.precio * x.qty, 0)

  async function buscarDni(){
    if(!/^\d{8}$/.test(String(dni))) { alert('DNI inválido (8 dígitos)'); return }
    setBuscandoDni(true)
    try{
      const { data } = await api.get('/integraciones/dni', { params: { dni } })
      const nombre = data?.nombre_completo || [data?.nombres, data?.apellido_paterno, data?.apellido_materno].filter(Boolean).join(' ')
      const base = (data?.nombres || nombre?.split(' ')?.[0] || 'cliente').toLowerCase().replace(/[^a-z0-9]/g,'')
      setClientePreview({ nombre: nombre || `Cliente DNI ${dni}`, telefono: '999999999', email: `${base || 'cliente'}@demo.com` })
    }catch{
      setClientePreview({ nombre: `Cliente DNI ${dni}`, telefono: '999999999', email: `cliente${dni}@demo.com` })
    }finally{
      setBuscandoDni(false)
    }
  }

  async function saveSale(){
    if(!cart.length){ alert('Agrega productos al carrito'); return }
    if(!/^\d{8}$/.test(String(dni))) { alert('DNI inválido (8 dígitos)'); return }

    setSaving(true)
    try{
      const payload = {
        dni,
        items: cart.map(x => ({ id_producto: x.id, cantidad: x.qty, precio_unitario: x.precio }))
      }
      const { data } = await api.post('/ventas', payload)
      // opcional: imprimir comprobante
      const det = await api.get(`/ventas/${data.id}`)
      printTicket(det.data, { size: ticketSize })

      alert('Venta registrada ✅')
      setCart([]); setDni(''); setClientePreview({ nombre:'', email:'', telefono:'' })
    }catch(err){
      alert('Error: '+(err?.response?.data?.message || err.message))
    }finally{ setSaving(false) }
  }

  return (
    <div className="grid" style={{gap:16}}>
      <div className="grid cols-2">
        <div className="card">
          <h3 style={{marginTop:0}}>Buscar productos</h3>
          <input placeholder="Buscar por nombre…" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <div style={{marginTop:12, maxHeight:280, overflow:'auto'}}>
            <table className="table">
              <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {filtered.map(p=>(
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>S/. {Number(p.precio||0).toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td><button onClick={()=>addToCart(p)}>Agregar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>Carrito</h3>
          {cart.length === 0 ? <div>No hay productos</div> : (
            <table className="table">
              <thead><tr><th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {cart.map(item=>(
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td><input type="number" min="1" value={item.qty} onChange={(e)=>updateQty(item.id, e.target.value)} style={{width:80}} /></td>
                    <td>S/. {item.precio.toFixed(2)}</td>
                    <td>S/. {(item.precio*item.qty).toFixed(2)}</td>
                    <td><button onClick={()=>removeItem(item.id)} style={{background:'#2a0f15'}}>Quitar</button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan="3" style={{textAlign:'right'}}><strong>Total</strong></td><td colSpan="2"><strong>S/. {total.toFixed(2)}</strong></td></tr></tfoot>
            </table>
          )}

          <div className="card" style={{padding:12, marginTop:12}}>
            <label>DNI</label>
            <div style={{display:'flex', gap:8}}>
              <input placeholder="########" value={dni} maxLength={8} onChange={(e)=>setDni(e.target.value)} />
              <button className="ghost" onClick={buscarDni} disabled={buscandoDni}>{buscandoDni ? 'Buscando…' : 'Buscar DNI'}</button>
            </div>
            <div style={{marginTop:8}}>
              <label>Nombre</label>
              <input readOnly value={clientePreview.nombre} placeholder="Se llena automáticamente" />
            </div>
            <div className="grid cols-2" style={{gap:8, marginTop:8}}>
              <div><label>Teléfono</label><input readOnly value={clientePreview.telefono} placeholder="999999999" /></div>
              <div><label>Correo</label><input readOnly value={clientePreview.email} placeholder="nombre@demo.com" /></div>
            </div>
          </div>
          <div className="actions" style={{marginTop:12, textAlign:'right', display:'flex', gap:8, justifyContent:'flex-end', alignItems:'center'}}>
            <label>Formato:</label>
            <select value={ticketSize} onChange={e=>setTicketSize(e.target.value)}>
              <option value="58mm">58 mm</option>
              <option value="80mm">80 mm</option>
              <option value="A4">A4</option>
            </select>
            <button className="primary" onClick={saveSale} disabled={saving || cart.length===0}>
              {saving ? 'Guardando…' : 'Registrar venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
