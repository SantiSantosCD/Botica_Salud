import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext.jsx'
import Navbar from '@/components/Navbar.jsx'
import Sidebar from '@/components/Sidebar.jsx'
import Login from '@/pages/Login.jsx'
import Dashboard from '@/pages/Dashboard.jsx'
import Products from '@/pages/Products.jsx'
import Sales from '@/pages/Sales.jsx'
import Clients from '@/pages/Clients.jsx'
import Users from '@/pages/Users.jsx'
import RequireRole from '@/components/RequireRole.jsx'
import NotFound from '@/pages/NotFound.jsx'

function Shell({ children }){
  const location = useLocation()
  // Do not show shell for login route
  const isLogin = location.pathname === '/login'
  if(isLogin) return children
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>💊</span>
          <div>Botica<span style={{color:'#55d6be'}}>Pro</span></div>
        </div>
        <Sidebar/>
      </aside>
      <header className="navbar">
        <Navbar/>
      </header>
      <main className="main">
        {children}
      </main>
    </div>
  )
}
function UsersPage(){ return <div className="card"><h3>Gestión de usuarios (admin)</h3><p>Conéctalo a /api/usuarios si quieres.</p></div> }

function PrivateRoute({ children }){
  const { token } = useAuth()
  if(!token){
    return <Navigate to="/login" replace />
  }
  return children
}
export default function App(){
  return (
    <AuthProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
          <Route path="/productos" element={<PrivateRoute><Products/></PrivateRoute>} />
          <Route path="/ventas" element={<PrivateRoute><Sales/></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><Clients/></PrivateRoute>} />

          {/* Solo admin */}
          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <RequireRole roles={['admin']}>
                  <Users/>
                </RequireRole>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound/>} />
        </Routes>
      </Shell>
    </AuthProvider>
  )
}
