import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '@/services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login({ username, email, password }){
    setError('')
    setLoading(true)
    try{
      const payload = email ? { email, password } : { username, password }
      const { data } = await api.post('/auth/login', payload)
      const tok = data?.token || data?.accessToken || ''
      if(!tok) throw new Error('No se recibió token')
      setToken(tok)
      localStorage.setItem('token', tok)
      // optional: fetch profile
      try{
        const me = await api.get('/auth/profile')
        setUser(me.data || null)
        localStorage.setItem('user', JSON.stringify(me.data || null))
      }catch{ /* ignore */ }
      return true
    }catch(err){
      setError(err?.response?.data?.message || err.message || 'Error al iniciar sesión')
      return false
    }finally{
      setLoading(false)
    }
  }

  function logout(){
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const value = useMemo(() => ({ token, user, login, logout, loading, error }), [token, user, loading, error])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  const ctx = useContext(AuthContext)
  if(!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
