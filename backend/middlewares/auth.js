import jwt from 'jsonwebtoken'
export function requireAuth(req, res, next){
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if(!token) return res.status(401).json({ message:'No autorizado' })
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_123')
    req.user = payload
    next()
  }catch(e){
    return res.status(401).json({ message:'Token inválido' })
  }
}
export function requireRole(...roles){
  return (req, res, next) => {
    if(!req.user) return res.status(401).json({ message:'No autorizado' })
    if(!roles.includes(req.user.rol)) return res.status(403).json({ message:'Acceso denegado' })
    next()
  }
}
