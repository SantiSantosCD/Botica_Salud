import { useEffect, useState } from 'react'
import api from '@/services/api.js'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function Dashboard(){
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(()=>{
    (async()=>{
      try{
        const { data } = await api.get('/dashboard/metricas')
        setMetrics(data)
      }catch(err){
        setError(err?.response?.data?.message || err.message)
      }finally{
        setLoading(false)
      }
    })()
  }, [])

  if(loading) return <div className="card">Cargando…</div>
  if(error) return <div className="card">Error: {error}</div>

  const ventas = metrics?.ventasUltimos7Dias || metrics?.ventas_ultimos_7_dias || []
  const top = metrics?.topProductos || metrics?.productos_mas_vendidos || []

  return (
    <div className="grid" style={{gap:16}}>
      <div className="grid cols-3">
        <div className="card kpi">
          <div>
            <small>Ventas del día</small>
            <div><strong>S/. {(metrics?.ventasHoy || metrics?.ventas_hoy || 0).toFixed(2)}</strong></div>
          </div>
          <div>🧾</div>
        </div>
        <div className="card kpi">
          <div>
            <small>Productos con bajo stock</small>
            <div><strong>{metrics?.bajoStock || metrics?.stock_bajo || 0}</strong></div>
          </div>
          <div>⚠️</div>
        </div>
        <div className="card kpi">
          <div>
            <small>Alertas no leídas</small>
            <div><strong>{metrics?.alertasNoLeidas || metrics?.alertas_no_leidas || 0}</strong></div>
          </div>
          <div>🔔</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginTop:0}}>Ventas – últimos 7 días</h3>
        <div style={{height:260}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ventas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginTop:0}}>Top productos (última semana)</h3>
        <table className="table">
          <thead>
            <tr><th>Producto</th><th>Unidades</th></tr>
          </thead>
          <tbody>
            {top.map((p, idx)=>(
              <tr key={idx}>
                <td>{p.nombre || p.producto}</td>
                <td>{p.unidades || p.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
