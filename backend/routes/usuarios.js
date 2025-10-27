import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { requireAuth, requireRole } from '../middlewares/auth.js'

const router = Router()
const ALLOWED_ROLES = ['admin', 'empleado']

// Listar usuarios (solo admin)
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const [rows] = await req.pool.query(
    'SELECT id, nombre, username, email, rol FROM usuarios ORDER BY id DESC'
  )
  res.json(rows)
})

// Crear usuario (solo admin)
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { nombre, username, email, password, rol } = req.body || {}
  if (!nombre || !username || !email || !password) {
    return res.status(400).json({ message: 'nombre, username, email y password son obligatorios' })
  }
  const role = String(rol || 'empleado').toLowerCase()
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Rol inválido (usa admin o empleado)' })
  }
  const [exists] = await req.pool.query(
    'SELECT id FROM usuarios WHERE username=? OR email=?',
    [username, email]
  )
  if (exists.length) {
    return res.status(409).json({ message: 'username o email ya existen' })
  }
  const hash = bcrypt.hashSync(password, 10)
  await req.pool.query(
    'INSERT INTO usuarios (nombre, username, email, password_hash, rol) VALUES (?,?,?,?,?)',
    [nombre, username, email, hash, role]
  )
  res.status(201).json({ ok: true })
})

// Cambiar rol (solo admin)
router.put('/:id/rol', requireAuth, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id)
  const role = String(req.body?.rol || '').toLowerCase()
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Rol inválido (usa admin o empleado)' })
  }
  const [rows] = await req.pool.query('SELECT id FROM usuarios WHERE id=?', [id])
  if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' })

  await req.pool.query('UPDATE usuarios SET rol=? WHERE id=?', [role, id])
  res.json({ ok: true })
})

export default router
