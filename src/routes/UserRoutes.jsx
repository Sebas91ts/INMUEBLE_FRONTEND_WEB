// routes/ClientRoutes.jsx
import { Route, Routes, Navigate } from 'react-router-dom'
import HomeUser from '../pages/HomeUser/HomeUser'
import Home from '../pages/HomeUser/ContentHomeUser'

export default function UserRoutes() {
  return (
    <Routes>
      {/* Layout de cliente */}
      <Route path='/' element={<HomeUser />}>
        {/* Página por defecto */}
        <Route index element={<Home />} />
        {/* Otras páginas de cliente */}
        <Route path='propiedades' element={<div>Propiedades</div>} />
        <Route path='nosotros' element={<div>Nosotros</div>} />
        <Route path='contacto' element={<div>Contacto</div>} />
        {/* Redireccionamiento por defecto */}
        <Route path='*' element={<Navigate to='/' />} />
      </Route>
    </Routes>
  )
}
