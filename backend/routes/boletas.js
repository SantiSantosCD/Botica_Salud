import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const { q, desde, hasta, page = 1, pageSize = 20 } = req.query
  const p = Math.max(1, Number(page) || 1)
  const ps = Math.min(100, Math.max(1, Number(pageSize) || 20))

  let where = 'WHERE 1=1'
  const params = []

  if (q && String(q).trim()) {
    where += ' AND (v.dni LIKE ? OR v.nombre_cliente LIKE ?)'
    const like = `%${String(q).trim()}%`
    params.push(like, like)
  }
  if (desde) { where += ' AND DATE(v.fecha) >= ?'; params.push(desde) }
  if (hasta) { where += ' AND DATE(v.fecha) <= ?'; params.push(hasta) }

  const offset = (p - 1) * ps

  const [rows] = await req.pool.query(
    `SELECT v.id, v.fecha, v.dni, v.nombre_cliente, v.total,
            GROUP_CONCAT(CONCAT(p.nombre, ' x', dv.cantidad) SEPARATOR '; ') AS detalle
     FROM ventas v
     JOIN detalle_venta dv ON dv.id_venta = v.id
     JOIN productos p ON p.id = dv.id_producto
     ${where}
     GROUP BY v.id
     ORDER BY v.id DESC
     LIMIT ? OFFSET ?`,
    [...params, ps, offset]
  )

  res.json({ page: p, pageSize: ps, items: rows })
})

export default router
