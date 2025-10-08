// routes/AdminRoutes.jsx
import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoutes'
import PrivilegedRoute from '../components/PrivilegedRoute'

import Dashboard from '../pages/Dashboard/Dashboard'
import EstadisticasDashboard from '../pages/Dashboard/components/EstadisticasDashboard'


import Bitacora from '../pages/Bitacora/Bitacora'
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
                 {/* Bitácora */}
       <Route
          path='bitacora'
          element={
            <PrivilegedRoute componente='bitacora'>
              <Bitacora />
            </PrivilegedRoute>
          }
        />
      </Route>
        
      <Route path='*' element={<Navigate to='/dashboard' />} />
    </Routes>
  )
}
