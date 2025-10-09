// routes/AdminRoutes.jsx
import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoutes'
import PrivilegedRoute from '../components/PrivilegedRoute'

import Dashboard from '../pages/Dashboard/Dashboard'
import EstadisticasDashboard from '../pages/Dashboard/components/EstadisticasDashboard'
import SolicitudesAgentes from '../pages/SolicitudAgente/SolicitudAgente'
import Contratos from '../pages/Contratos/Contratos'
import UsuariosDashboard from '../pages/Usuarios/Usuarios'
import EditarPerfil from '../pages/Dashboard/components/EditarPerfil'

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

        <Route path='solicitud-agente' element={<SolicitudesAgentes />} />
        <Route path='contratos' element={<Contratos />} />
        <Route path='usuarios' element={<UsuariosDashboard />} />
        <Route path='editar-perfil' element={<EditarPerfil />} />
      </Route>

      <Route path='*' element={<Navigate to='/dashboard' />} />
    </Routes>
  )
}
