import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api'
})

// add token
api.interceptors.request.use((config)=>{
  const token = localStorage.getItem('token')
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// handle 401
api.interceptors.response.use(
  (res)=>res,
  (err)=>{
    if(err?.response?.status === 401){
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if(!location.pathname.startsWith('/login')){
        location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
