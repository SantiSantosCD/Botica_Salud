import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const router = Router()
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body || {}
  if(!password || (!email && !username)){
    return res.status(400).json({ message: 'Faltan credenciales' })
  }
  const [rows] = await req.pool.query(
    email ? 'SELECT * FROM usuarios WHERE email=?' : 'SELECT * FROM usuarios WHERE username=?',
    [email || username]
  )
  const user = rows[0]
  if(!user) return res.status(401).json({ message:'Usuario no encontrado' })
  const ok = bcrypt.compareSync(password, user.password_hash || '')
  if(!ok) return res.status(401).json({ message:'Credenciales inválidas' })
  const token = jwt.sign({ id:user.id, nombre:user.nombre, email:user.email, rol:user.rol }, process.env.JWT_SECRET || 'dev_secret_123', { expiresIn:'8h' })
  res.json({ token })
})
router.get('/profile', (req,res)=>{
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if(!token) return res.json({ nombre:'Usuario', rol:'empleado' })
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_123')
    res.json(payload)
  }catch{
    res.json({ nombre:'Usuario', rol:'empleado' })
  }
})
export default router
