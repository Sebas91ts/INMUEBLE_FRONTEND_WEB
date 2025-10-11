import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import HomeUser from '../pages/HomeUser/HomeUser'
import Home from '../pages/HomeUser/ContentHomeUser'
import PrivilegedRoute from '../components/PrivilegedRoute'
import EditarPerfil from '../pages/Dashboard/components/EditarPerfil'
import Propiedades from '../pages/HomeUser/Propiedades'
import PropiedadDetail from '../pages/HomeUser/PropiedadDetail'
import AgentesInmobiliaria from '../pages/AgentesList/Agentes'
import ChatPage from '../pages/Chat/ChatPage'
import { ChatProvider } from '../contexts/ChatContext'
import Desempeno from '../pages/Desempeno/Desempeno'
import CreateInmueble from '../pages/Inmuebles/CreateInmueble'

export default function UserRoutes() {
  return (
    // Provider para escuchar el chat en toda la sesion web del usuario
    <ChatProvider>
      <Routes>
        <Route path='/' element={<HomeUser />}>
          {/* Página por defecto */}
          <Route index element={<Home />} />

          {/* Páginas públicas */}
          <Route path='nosotros' element={<div>Nosotros</div>} />
          <Route path='contacto' element={<div>Contacto</div>} />
          <Route path='editar-perfil' element={<EditarPerfil />} />
          <Route path='agentes-contacto' element={<AgentesInmobiliaria />} />
          <Route path='chat' element={<ChatPage />} />
          <Route path='desempeno' element={<Desempeno/>} />
          <Route path="inmuebles/crear" element={<CreateInmueble />} />
          

          {/* Páginas protegidas por privilegios */}
          <Route
            path='propiedades'
            element={
              <PrivilegedRoute componente='Inmueble'>
                <Outlet />
              </PrivilegedRoute>
            }
          >
            <Route
            path='propiedades'
            element={
              <PrivilegedRoute componente='Inmueble'>
                <Outlet />
              </PrivilegedRoute>
            }
          ></Route>
            {/* ✅ Listado de propiedades */}
            <Route index element={<Propiedades />} />

            {/* ✅ Detalle de un inmueble */}
            <Route path=':id' element={<PropiedadDetail />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path='*' element={<Navigate to='/' />} />
        </Route>
      </Routes>
    </ChatProvider>
  )
}
