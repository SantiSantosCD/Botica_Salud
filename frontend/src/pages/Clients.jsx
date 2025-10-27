import { useEffect, useState } from 'react'
import api from '@/services/api.js'
import { printTicket } from '@/utils/receipt.js'


export default function Clients(){ // ← reusamos el nombre para no romper rutas
  const [q, setQ] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])

  const [preview, setPreview] = useState(null)          // { venta, items }
  const [loadingPreview, setLoadingPreview] = useState(false)

  const [ticketSize, setTicketSize] = useState('80mm') // '58mm' | '80mm' | 'A4'

  async function fetchBoletas(){
    setLoading(true); setError('')
    try{
      const { data } = await api.get('/boletas', {
        params: { q: q || undefined, desde: desde || undefined, hasta: hasta || undefined, page, pageSize }
      })
      setRows(Array.isArray(data?.items) ? data.items : [])
    }catch(err){
      setError(err?.response?.data?.message || err.message)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchBoletas() }, [page, pageSize]) // filtros de fecha/consulta se aplican con el botón Buscar

  function onBuscar(){
    setPage(1)
    fetchBoletas()
  }

  async function openPreview(id){
    setLoadingPreview(true)
    try{
      const { data } = await api.get(`/ventas/${id}`)
      setPreview(data) // { venta, items }
    }catch(err){
      alert('No se pudo cargar la boleta: ' + (err?.response?.data?.message || err.message))
    }finally{
      setLoadingPreview(false)
    }
  }

  function closePreview(){ setPreview(null) }

  function imprimirComprobante(data){
    const { venta, items } = data || {}
    const fmt = new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', minimumFractionDigits:2 })
    const fecha = venta?.fecha ? new Date(venta.fecha) : new Date()
    const f = fecha.toLocaleString('es-PE', { dateStyle:'short', timeStyle:'short' })
    const filas = (items||[]).map((it,i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${it.nombre||''}</td>
        <td style="text-align:center">${it.cantidad}</td>
        <td style="text-align:right">${fmt.format(Number(it.precio_unitario||0))}</td>
        <td style="text-align:right">${fmt.format(Number(it.precio_unitario||0)*Number(it.cantidad||0))}</td>
      </tr>
    `).join('')
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Boleta #${venta?.id||''}</title>
    <style>*{font-family:Arial,Helvetica,sans-serif}table{width:100%;border-collapse:collapse}th,td{padding:6px;border-bottom:1px solid #eee}</style>
    </head><body>
    <h3>Boleta #${venta?.id||''}</h3>
    <div>Fecha: ${f}</div>
    <div>Cliente: ${venta?.cliente||'-'} (DNI: ${venta?.dni||'-'})</div>
    <table>
      <thead><tr><th>#</th><th>Producto</th><th>Cant.</th><th>P.Unit.</th><th>Subtotal</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <h3 style="text-align:right">Total: ${fmt.format(Number(venta?.total||0))}</h3>
    <script>window.print()</script></body></html>`
    const win = window.open('', '_blank','width=820,height=900'); if(!win){alert('Permite ventanas emergentes');return}
    win.document.open(); win.document.write(html); win.document.close()
  }

  const canPrev = page > 1
  const canNext = rows.length === Number(pageSize) // si devuelve menos que pageSize, asumimos no hay más

  return (
    <div className="grid" style={{gap:16}}>
      {/* Filtros */}
      <div className="card">
        <h3 style={{marginTop:0}}>Boletas</h3>
        <div className="grid cols-4" style={{gap:8}}>
          <div>
            <label>Buscar (DNI o Nombre)</label>
            <input placeholder="Ej: 12345678 o Juan" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <div>
            <label>Desde</label>
            <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} />
          </div>
          <div>
            <label>Hasta</label>
            <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} />
          </div>
          <div style={{display:'flex', gap:8, alignItems:'end', justifyContent:'flex-end'}}>
            <select value={pageSize} onChange={e=>{ setPageSize(Number(e.target.value)); setPage(1) }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <button className="ghost" onClick={onBuscar}>Buscar</button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        {loading ? 'Cargando…' : error ? ('Error: ' + error) : (
          <div style={{overflow:'auto', maxHeight:420}}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>DNI</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Detalle (resumen)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r=>{
                  const fecha = r.fecha ? new Date(r.fecha).toLocaleString('es-PE', { dateStyle:'short', timeStyle:'short' }) : '-'
                  const total = new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN' }).format(Number(r.total||0))
                  return (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{fecha}</td>
                      <td>{r.dni}</td>
                      <td>{r.nombre_cliente}</td>
                      <td>{total}</td>
                      <td title={r.detalle}>{r.detalle || '-'}</td>
                      <td style={{textAlign:'right'}}>
                        <button onClick={()=>openPreview(r.id)} disabled={loadingPreview}>
                          {loadingPreview && preview?.venta?.id === r.id ? 'Cargando…' : 'Ver'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación simple */}
        <div className="actions" style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
          <button className="ghost" onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={!canPrev}>← Anterior</button>
          <div>Página {page}</div>
          <button className="ghost" onClick={()=>setPage(p=>p+1)} disabled={!canNext}>Siguiente →</button>
        </div>
      </div>

      {/* Vista previa / Imprimir */}
      {preview && (
        <div className="card" style={{border:'1px solid #333'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{margin:0}}>Vista previa – Boleta #{preview?.venta?.id}</h3>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
  <label>Formato:</label>
  <select value={ticketSize} onChange={(e)=>setTicketSize(e.target.value)}>
    <option value="58mm">58 mm</option>
    <option value="80mm">80 mm</option>
    <option value="A4">A4</option>
  </select>
</div>

            <div style={{display:'flex', gap:8}}>
              <button className="ghost" onClick={()=>printTicket(preview, { size: ticketSize })}>Imprimir</button>
              <button onClick={closePreview} style={{background:'#2a0f15'}}>Cerrar</button>
            </div>
          </div>
          <div style={{marginTop:8}}>
            <div><strong>Cliente:</strong> {preview?.venta?.cliente} — <strong>DNI:</strong> {preview?.venta?.dni}</div>
            <div><strong>Fecha:</strong> {preview?.venta?.fecha ? new Date(preview.venta.fecha).toLocaleString('es-PE', { dateStyle:'short', timeStyle:'short' }) : '-'}</div>
            <div style={{marginTop:8}}>
              <table className="table">
                <thead><tr><th>#</th><th>Producto</th><th>Cant.</th><th>P.Unit.</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {(preview?.items||[]).map((it,i)=>(
                    <tr key={i}>
                      <td>{i+1}</td>
                      <td>{it.nombre}</td>
                      <td>{it.cantidad}</td>
                      <td>S/. {Number(it.precio_unitario||0).toFixed(2)}</td>
                      <td>S/. {(Number(it.precio_unitario||0)*Number(it.cantidad||0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{textAlign:'right'}}>
                <strong>Total: S/. {Number(preview?.venta?.total||0).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
