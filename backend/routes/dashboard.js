import { Router } from 'express'
const router = Router()

// Helper para YYYY-MM-DD en hora local (sin UTC)
function ymdLocal(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

router.get('/metricas', async (req, res) => {
  const pool = req.pool

  // Total de hoy (hora local de MySQL)
  const [ventasHoyRow] = await pool.query(
    `SELECT IFNULL(SUM(total),0) AS total
     FROM ventas
     WHERE DATE(fecha) = CURDATE()`
  )
  const ventasHoy = Number(ventasHoyRow[0]?.total || 0)

  // Productos con bajo stock
  const [bajo] = await pool.query(
    `SELECT COUNT(1) AS c FROM productos WHERE stock <= 10`
  )
  const bajoStock = Number(bajo[0]?.c || 0)

  // Serie últimos 7 días (incluye hoy)
  const [serie] = await pool.query(
    `SELECT DATE_FORMAT(fecha,'%Y-%m-%d') AS d, IFNULL(SUM(total),0) AS total
     FROM ventas
     WHERE fecha >= CURDATE() - INTERVAL 6 DAY
     GROUP BY DATE(fecha)
     ORDER BY d`
  )

  // Completar días sin ventas con 0 (evitar huecos)
  const map = new Map(serie.map(r => [r.d, Number(r.total || 0)]))
  const ventasUltimos7Dias = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date()
    dt.setDate(dt.getDate() - (6 - i)) // 6 días atrás … hoy
    const key = ymdLocal(dt)
    return { fecha: key, total: map.get(key) || 0 }
  })

  // Top productos últimos 7 días (incluye hoy)
  const [top] = await pool.query(
    `SELECT p.nombre, SUM(dv.cantidad) AS unidades
     FROM detalle_venta dv
     JOIN ventas v ON v.id = dv.id_venta
     JOIN productos p ON p.id = dv.id_producto
     WHERE v.fecha >= CURDATE() - INTERVAL 6 DAY
     GROUP BY p.id, p.nombre
     ORDER BY unidades DESC
     LIMIT 10`
  )

  res.json({
    ventasHoy,
    bajoStock,
    alertas_no_leidas: 0,
    ventasUltimos7Dias,
    topProductos: top
  })
})

export default router
