import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import { pool } from './config/db.js'
import authRouter from './routes/auth.js'
import productosRouter from './routes/productos.js'
import ventasRouter from './routes/ventas.js'
import dashboardRouter from './routes/dashboard.js'
import boletasRouter from './routes/boletas.js'
import integracionesRouter from './routes/integraciones.js'
import usuariosRouter from './routes/usuarios.js' 

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Backend Botica – sin tabla clientes',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      productos: '/api/productos',
      ventas: '/api/ventas',
      dashboard: '/api/dashboard',
      boletas: '/api/boletas',
      integraciones: '/api/integraciones',
      usuarios: '/api/usuarios'
    }
  })
})

app.use((req, _res, next) => { req.pool = pool; next() })

app.use('/api/auth', authRouter)
app.use('/api/productos', productosRouter)
app.use('/api/ventas', ventasRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/boletas', boletasRouter)
app.use('/api/integraciones', integracionesRouter)
app.use('/api/usuarios', usuariosRouter)

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(err.status || 500).json({ message: err.message || 'Error interno' })
})

pool.query("SET time_zone = '-05:00'")
  .catch(err => console.warn('No se pudo fijar time_zone:', err?.message))

app.listen(PORT, () => {
  console.log(`✅ Botica backend (sin clientes) en http://127.0.0.1:${PORT}`)
})
