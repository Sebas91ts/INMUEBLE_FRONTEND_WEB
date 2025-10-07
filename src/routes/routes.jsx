// routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../pages/login'
import AdminRoutes from './AdminRoutes'
import UserRoutes from './UserRoutes'
import HomeUser from '../pages/HomeUser/HomeUser'
import Home from '../pages/HomeUser/ContentHomeUser'

export default function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  // Rutas protegidas solo para admin
  if (isAuthenticated && user?.grupo_id === 1) {
    return <AdminRoutes />
  }

  // Rutas públicas (cliente / Home) y login
  return (
    <Routes>
      {/* Layout del cliente */}
      <Route path='/' element={<HomeUser />}>
        <Route index element={<Home />} />
      </Route>

      <Route path='/login' element={<LoginForm />} />
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}
