// src/routes/UserRoutes.jsx
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
import EnAprobado from '../pages/Inmueble/Agente/MisInmuebles'
import CreateInmuebleAgente from '../pages/Inmueble/Agente/CreateInmueble'
import Desempeno from '../pages/Desempeno/Desempeno'
import CreateInmueble from '../pages/Inmuebles/CreateInmueble'
import Citas from '../pages/Citas/Citas'
import HistorialPublicaciones from '../pages/Inmueble/Agente/HistorialPublicaciones'
import DetalleHistorial from '../pages/Inmueble/Agente/DetalleHistorial'
import FormContratoServicios from '../pages/Contratos/components/FormContratoServicios'
import DashboardComisionAgente from '../pages/Comisiones/DashboardComisionAgente'

export default function UserRoutes() {
  return (
    <ChatProvider>
      <Routes>
        <Route path='/' element={<HomeUser />}>
          {/* --- ZONA PÚBLICA --- */}
          {/* Estas rutas son accesibles para CUALQUIER visitante */}
          <Route index element={<Home />} />
          <Route path='nosotros' element={<div>Nosotros</div>} />
          <Route path='contacto' element={<div>Contacto</div>} />

          {/* ✅ RUTA DE PROPIEDADES PÚBLICA Y CORRECTA */}
          <Route path='propiedades'>
            <Route index element={<Propiedades />} /> {/* Muestra la lista */}
            <Route path=':id' element={<PropiedadDetail />} /> {/* Muestra el detalle */}
          </Route>


          {/* --- ZONA PRIVADA Y PROTEGIDA --- */}
          {/* Estas rutas requieren que el usuario inicie sesión y/o tenga privilegios */}
          <Route path='editar-perfil' element={<EditarPerfil />} />
          <Route path='agentes-contacto' element={<AgentesInmobiliaria />} />
          <Route path='chat' element={<ChatPage />} />

          <Route
            path='desempeno'
            element={
              <PrivilegedRoute componente='Inmueble'>
                <Desempeno />
              </PrivilegedRoute>
            }
          />

          <Route
            path='inmuebles/crear'
            element={
              <PrivilegedRoute componente='Inmueble'>
                <CreateInmueble />
              </PrivilegedRoute>
            }
          />
          
          <Route
            path='mis-inmuebles'
            element={
              <PrivilegedRoute componente='Inmueble'>
                <Outlet />
              </PrivilegedRoute>
            }
          >
            <Route path='aprobados' element={<EnAprobado />} />
            <Route path='crear' element={<CreateInmuebleAgente />} />
            <Route path='historial' element={<HistorialPublicaciones />} />
            <Route path='detalle/:id' element={<DetalleHistorial />} />
          </Route>

          <Route
            path='citas'
            element={
              <PrivilegedRoute componente='cita'>
                <Citas />
              </PrivilegedRoute>
            }
          />

          <Route
            path='contratos'
            element={
              <PrivilegedRoute componente='contrato'>
                <FormContratoServicios />
              </PrivilegedRoute>
            }
          />

          <Route path='comisiones' element={<DashboardComisionAgente />} />

          {/* Redirección por defecto para cualquier ruta no encontrada */}
          <Route path='*' element={<Navigate to='/' />} />
        </Route>
      </Routes>
    </ChatProvider>
  )
}