import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/auth.js'
const router = Router()
router.get('/', async (req,res)=>{
  const { search } = req.query
  let sql = 'SELECT * FROM productos'
  let params = []
  if(search){
    sql += ' WHERE LOWER(nombre) LIKE ? OR LOWER(categoria) LIKE ?'
    const s = `%${String(search).toLowerCase()}%`
    params = [s, s]
  }
  sql += ' ORDER BY id DESC'
  const [rows] = await req.pool.query(sql, params)
  res.json(rows)
})
router.post('/', requireAuth, requireRole('admin'), async (req,res)=>{
  const { nombre, descripcion, precio, stock, categoria, fecha_vencimiento } = req.body || {}
  if(!nombre || precio==null || stock==null){
    return res.status(400).json({ message:'Nombre, precio y stock son obligatorios' })
  }
  const [result] = await req.pool.query(
    'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, fecha_vencimiento) VALUES (?,?,?,?,?,?)',
    [nombre, descripcion||'', Number(precio)||0, Number(stock)||0, categoria||'', fecha_vencimiento||null]
  )
  const [rows] = await req.pool.query('SELECT * FROM productos WHERE id=?', [result.insertId])
  res.status(201).json(rows[0])
})
router.put('/:id', requireAuth, requireRole('admin'), async (req,res)=>{
  const id = Number(req.params.id)
  const [rows] = await req.pool.query('SELECT * FROM productos WHERE id=?', [id])
  const exists = rows[0]
  if(!exists) return res.status(404).json({ message:'Producto no encontrado' })
  const { nombre, descripcion, precio, stock, categoria, fecha_vencimiento } = req.body || {}
  const upd = {
    nombre: nombre ?? exists.nombre,
    descripcion: descripcion ?? exists.descripcion,
    precio: precio ?? exists.precio,
    stock: stock ?? exists.stock,
    categoria: categoria ?? exists.categoria,
    fecha_vencimiento: fecha_vencimiento ?? exists.fecha_vencimiento
  }
  await req.pool.query('UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, categoria=?, fecha_vencimiento=? WHERE id=?',
    [upd.nombre, upd.descripcion, upd.precio, upd.stock, upd.categoria, upd.fecha_vencimiento, id])
  const [finalRow] = await req.pool.query('SELECT * FROM productos WHERE id=?', [id])
  res.json(finalRow[0])
})
router.delete('/:id', requireAuth, requireRole('admin'), async (req,res)=>{
  const id = Number(req.params.id)
  const [rows] = await req.pool.query('SELECT * FROM productos WHERE id=?', [id])
  if(rows.length===0) return res.status(404).json({ message:'Producto no encontrado' })
  await req.pool.query('DELETE FROM productos WHERE id=?', [id])
  res.json({ ok:true })
})
export default router
