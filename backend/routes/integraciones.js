import { Router } from 'express'
const router = Router()
router.get('/dni', async (req, res) => {
  const dni = String(req.query.dni || '').trim()
  if (!/^\d{8}$/.test(dni)) return res.status(400).json({ message: 'DNI inválido (8 dígitos)' })
  const token = process.env.API_PERU_TOKEN
  if (!token) return res.status(500).json({ message: 'Falta API_PERU_TOKEN en .env' })
  try {
    const r = await fetch('https://apiperu.dev/api/dni', {
      method: 'POST',
      headers: { 'Accept':'application/json','Content-Type':'application/json','Authorization': `Bearer ${token}` },
      body: JSON.stringify({ dni })
    })
    const json = await r.json()
    if (!json?.success || !json?.data) return res.status(404).json({ message: 'DNI no encontrado' })
    const d = json.data
    const nombre_completo = d.nombre_completo || [d.nombres, d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' ').trim()
    return res.json({ dni: d.numero || dni, nombre_completo, nombres:d.nombres||null, apellido_paterno:d.apellido_paterno||null, apellido_materno:d.apellido_materno||null })
  } catch (e) {
    console.error('lookup DNI error', e)
    return res.status(502).json({ message: 'Error consultando API externa' })
  }
})
export default router
