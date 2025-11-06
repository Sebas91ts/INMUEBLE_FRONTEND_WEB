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
import FormContratoAnticreticoServicios from '../pages/Contratos/components/FormContratoAnticreticoServicios'
import DashboardComisionAgente from '../pages/Comisiones/DashboardComisionAgente'
import ContratoAlquilerList from '../pages/ContratosAlquiler/ContratoAlquilerList';
import ContratoAlquilerForm from '../pages/ContratosAlquiler/ContratoAlquilerForm';
import ContratoAlquilerDetail from '../pages/ContratosAlquiler/ContratoAlquilerDetail';
import SeleccionTipoContrato from '../routes/SeleccionTipoContrato';

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

          {/* Páginas protegidas por privilegios */}
          <Route
            path='desempeno'
            element={
              <PrivilegedRoute componente='Inmueble'>
                <Desempeno />
              </PrivilegedRoute>
            }
          />

          <Route
            path='inmuebles'
            element={
              <PrivilegedRoute componente='Inmueble'>
                <Outlet />
              </PrivilegedRoute>
            }
          >
            <Route path='crear' element={<CreateInmueble />} />
          </Route>

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
          {/* 🧩 NUEVA SECCIÓN PARA EL AGENTE */}
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
      {/* 🧾 CONTRATOS GENERALES */}
      <Route
        path="contratos"
        element={
          <PrivilegedRoute componente="contrato">
            <Outlet />
          </PrivilegedRoute>
        }
      >
        {/* Página principal: selección del tipo de contrato */}
        <Route index element={<SeleccionTipoContrato />} />
      
        {/* Subrutas para cada tipo */}
        <Route path="venta" element={<FormContratoServicios />} />
        <Route path="alquiler" element={<FormContratoAnticreticoServicios />} />
        <Route path="anticretico" element={<FormContratoAnticreticoServicios />} />
      </Route>
// 🧾 CONTRATOS DE ALQUILER (CU27)
<Route
  path='contratos-alquiler'
  element={
    <PrivilegedRoute componente='contrato'>
      <Outlet />
    </PrivilegedRoute>
  }
>
  <Route index element={<ContratoAlquilerList />} />
  <Route path='nuevo' element={<ContratoAlquilerForm />} />
  <Route path=':id' element={<ContratoAlquilerDetail />} />
</Route>

          <Route path='comisiones' element={<DashboardComisionAgente />} />

          {/* Redirección por defecto */}
          <Route path='*' element={<Navigate to='/' />} />
        </Route>
      </Routes>
    </ChatProvider>
  )
}
