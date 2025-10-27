import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
const router = Router()
function slugLocal(s = '') { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() }
async function fetchDniData(dni, token) {
  if (!token) return null
  const r = await fetch('https://apiperu.dev/api/dni', {
    method: 'POST',
    headers: { 'Accept':'application/json','Content-Type':'application/json','Authorization': `Bearer ${token}` },
    body: JSON.stringify({ dni })
  })
  const j = await r.json()
  if (!j?.success || !j?.data) return null
  const d = j.data
  const nombre = d.nombre_completo || [d.nombres, d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' ').trim()
  const nombres = d.nombres || nombre?.split(' ')[0] || 'cliente'
  return { nombre, nombres }
}
router.post('/', requireAuth, async (req,res)=>{
  const { dni, items } = req.body || {}
  if(!/^\d{8}$/.test(String(dni||''))) return res.status(400).json({ message:'DNI inválido (8 dígitos)' })
  if(!Array.isArray(items) || items.length===0){ return res.status(400).json({ message:'Items es requerido' }) }
  const pool = req.pool
  const conn = await pool.getConnection()
  try{
    await conn.beginTransaction()
    let total = 0
    for(const it of items){
      const [rows] = await conn.query('SELECT id, nombre, precio, stock FROM productos WHERE id=? FOR UPDATE', [it.id_producto])
      const p = rows[0]
      if(!p) throw new Error(`Producto ${it.id_producto} no existe`)
      if(p.stock < it.cantidad) throw new Error(`Stock insuficiente para ${p.nombre}`)
      total += (it.precio_unitario ?? p.precio) * it.cantidad
    }
    const info = await fetchDniData(String(dni), process.env.API_PERU_TOKEN)
    const nombre = info?.nombre || `Cliente DNI ${dni}`
    const base = slugLocal(info?.nombres || nombre.split(' ')[0] || 'cliente')
    const telefono = '999999999'
    const email = `${base || 'cliente'}@demo.com`
    const now = new Date()
    const [insV] = await conn.query(
      'INSERT INTO ventas (fecha, total, id_usuario, dni, nombre_cliente, telefono, email) VALUES (?,?,?,?,?,?,?)',
      [now, total, req.user?.id || 1, dni, nombre, telefono, email]
    )
    const id_venta = insV.insertId
    for(const it of items){
      const [rows] = await conn.query('SELECT precio FROM productos WHERE id=?', [it.id_producto])
      const precioBase = rows[0]?.precio ?? 0
      const precio = it.precio_unitario ?? precioBase
      await conn.query('INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (?,?,?,?)',
        [id_venta, it.id_producto, it.cantidad, precio])
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id=?', [it.cantidad, it.id_producto])
    }
    await conn.commit()
    res.status(201).json({ id: id_venta, total, dni, nombre_cliente: nombre })
  }catch(e){
    await conn.rollback()
    res.status(400).json({ message: e.message || 'Error en la venta' })
  }finally{
    conn.release()
  }
})
router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ message: 'ID inválido' })
  try {
    const [ventaRows] = await req.pool.query(`
      SELECT v.id, v.fecha, v.total, v.dni, v.nombre_cliente as cliente, v.telefono, v.email, u.nombre AS usuario
      FROM ventas v
      LEFT JOIN usuarios u ON u.id = v.id_usuario
      WHERE v.id = ?
    `, [id])
    if (!ventaRows.length) return res.status(404).json({ message: 'Venta no encontrada' })
    const venta = ventaRows[0]
    const [items] = await req.pool.query(`
      SELECT dv.id_producto, p.nombre, dv.cantidad, dv.precio_unitario
      FROM detalle_venta dv
      JOIN productos p ON p.id = dv.id_producto
      WHERE dv.id_venta = ?
      ORDER BY dv.id ASC
    `, [id])
    return res.json({ venta, items })
  } catch (e) {
    console.error('detalle venta error:', e)
    return res.status(500).json({ message: 'Error interno' })
  }
})
export default router
