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
import AnticreticoPage from '../pages/Contratos/Anticretico/AnticreticoPage'
import CrearContratoPage from '../pages/Contratos/Anticretico/CrearContratoPage'
import ReportesIA from '../pages/Reportes/ReportesIA'
import Pagos from '../pages/Pagos/Pagos'
import ContratoAlquilerList from '../pages/ContratosAlquiler/ContratoAlquilerList';
import ContratoAlquilerForm from '../pages/ContratosAlquiler/ContratoAlquilerForm';
import ContratoAlquilerDetail from '../pages/ContratosAlquiler/ContratoAlquilerDetail';
import SeleccionTipoContrato from '../routes/SeleccionTipoContrato';
import PaginaGestionContratos from '../pages/Contratos/ContratoFinalPage'
import Notificaciones from '../pages/Alertas/Notificaciones' // <<< AÑADIR ESTA LÍNEA >>>
import MapaInteractivo from '../pages/MapaInteractivo/MapaInteractivo'; 
import { Map } from 'lucide-react';
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
          {/* ✅ NUEVA RUTA DEL MAPA (Protegida) */}
          <Route
              path='Mapa'
              element={
                  // Puedes usar PrivilegedRoute si quieres restringir quién ve el mapa
                  // O dejarlo libre si todos los logueados pueden verlo.
                  // Aquí uso PrivilegedRoute asumiendo que es parte del módulo 'Inmueble'
                  <PrivilegedRoute componente='Inmueble'>
                      <MapaInteractivo />
                  </PrivilegedRoute>
              }
          />

          {/* --- ZONA PRIVADA Y PROTEGIDA --- */}
          {/* Estas rutas requieren que el usuario inicie sesión y/o tenga privilegios */}
          <Route path='editar-perfil' element={<EditarPerfil />} />
          <Route path='agentes-contacto' element={<AgentesInmobiliaria />} />
          <Route path='chat' element={<ChatPage />} />
          <Route path='pago_alquiler' element={<Pagos />} />
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
          <Route 
            path="contratos-anticretico" // Gestión
            element={
              <PrivilegedRoute componente='contrato'>
                <AnticreticoPage />
              </PrivilegedRoute>
            } 
          />
          <Route 
            path="crear-contrato-anticretico" // Creación
            element={
              <PrivilegedRoute componente='contrato'>
                <CrearContratoPage />
              </PrivilegedRoute>
            } 
          />
          {/* === AÑADIR ESTE BLOQUE DE RUTA === */}
          <Route
            path='mis-notificaciones' // Ruta: /mis-notificaciones
            element={
              <PrivilegedRoute componente='ALERTA'>
                <Notificaciones />
              </PrivilegedRoute>
            }
          />

          <Route path="contratos-page" element={<PaginaGestionContratos />} />
          <Route path="/reportes" element={<ReportesIA />} />
          
          {/* Redirección por defecto */}
          <Route path='*' element={<Navigate to='/' />} />
        </Route>
      </Routes>
    </ChatProvider>
  )
}