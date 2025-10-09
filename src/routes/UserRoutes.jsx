import { Route, Routes, Navigate } from 'react-router-dom'
import HomeUser from '../pages/HomeUser/HomeUser'
import Home from '../pages/HomeUser/ContentHomeUser'
import PrivilegedRoute from '../components/PrivilegedRoute'
import EditarPerfil from '../pages/Dashboard/components/EditarPerfil'

export default function UserRoutes() {
  return (
    <Routes>
      <Route path='/' element={<HomeUser />}>
        {/* Página por defecto */}
        <Route index element={<Home />} />
        {/* Páginas públicas */}
        <Route path='nosotros' element={<div>Nosotros</div>} />
        <Route path='contacto' element={<div>Contacto</div>} />
        <Route path='editar-perfil' element={<EditarPerfil />} />
        {/* Páginas protegidas por privilegios */}
        <Route
          path='propiedades'
          element={
            <PrivilegedRoute componente='Propiedades'>
              <div>Propiedades</div>
            </PrivilegedRoute>
          }
        />
        {/* Redirección por defecto */}
        <Route path='*' element={<Navigate to='/' />} />
      </Route>
    </Routes>
  )
}
