// routes/AdminRoutes.jsx
import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoutes'
import Dashboard from '../pages/Dashboard/Dashboard'
import EstadisticasDashboard from '../pages/Dashboard/components/EstadisticasDashboard'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute requiredRole='admin'>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<EstadisticasDashboard />} />
        <Route path='estadisticas' element={<EstadisticasDashboard />} />
      </Route>

      <Route path='*' element={<Navigate to='/dashboard' />} />
    </Routes>
  )
}
