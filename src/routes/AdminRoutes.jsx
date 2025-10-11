// routes/AdminRoutes.jsx
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoutes";
import PrivilegedRoute from "../components/PrivilegedRoute";

import Dashboard from '../pages/Dashboard/Dashboard'
import EstadisticasDashboard from '../pages/Dashboard/components/EstadisticasDashboard'
import Grupos from '../pages/Permisos/Grupos'
import Privilegios from '../pages/Permisos/Privilegios'
import Componentes from '../pages/Permisos/Componentes'
import SolicitudesAgentes from '../pages/SolicitudAgente/SolicitudAgente'
import SolicitudInmueble from '../pages/SolicitudInmueble/SolicitudInmueble'
import Contratos from '../pages/Contratos/Contratos'
import UsuariosDashboard from '../pages/Usuarios/Usuarios'
import EditarPerfil from '../pages/Dashboard/components/EditarPerfil'
import CreateInmueble from '../pages/Inmuebles/CreateInmueble'
import EnVenta from '../pages/Inmuebles/EnVenta';
import EnAlquiler from "../pages/Inmuebles/EnAlquiler";
import EnAnticretico from "../pages/Inmuebles/EnAnticretico";
import InmuebleDetail from "../pages/Inmuebles/InmuebleDetail";
import Bitacora from '../pages/Bitacora/Bitacora'
export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<EstadisticasDashboard />} />
        <Route path='estadisticas' element={<EstadisticasDashboard />} />

        {/* Bitácora */}
        <Route
          path="bitacora"
          element={
            <PrivilegedRoute componente="bitacora">
              <Bitacora />
            </PrivilegedRoute>
          }
        />
             {/* === Inmuebles === */}
        {/* Ruta base: si van a /dashboard/inmuebles, mostramos "En venta" por defecto */}
        <Route
          path="inmuebles"
          element={
            <PrivilegedRoute componente="inmueble">
              <EnVenta />
            </PrivilegedRoute>
          }
        />
        <Route
          path="inmuebles/venta"
          element={
            <PrivilegedRoute componente="inmueble">
              <EnVenta />
            </PrivilegedRoute>
          }
        />
        <Route
          path="inmuebles/alquiler"
          element={
            <PrivilegedRoute componente="inmueble">
              <EnAlquiler />
            </PrivilegedRoute>
          }
        />
        <Route
          path="inmuebles/anticretico"
          element={
            <PrivilegedRoute componente="inmueble">
              <EnAnticretico />
            </PrivilegedRoute>
          }
        />
        <Route
          path="inmuebles/:id"
          element={
            <PrivilegedRoute componente="inmueble">
              <InmuebleDetail />
            </PrivilegedRoute>
          }
        />

        <Route path="inmuebles/crear" element={<CreateInmueble />} />
        <Route path='permisos/grupos' element={<Grupos />} />
        <Route path='permisos/privilegios' element={<Privilegios />} />
        <Route path='permisos/componentes' element={<Componentes />} />
        <Route path='solicitud-agente' element={<SolicitudesAgentes />} />
        <Route path='solicitud-inmueble' element={<SolicitudInmueble />} />
        <Route path='contratos' element={<Contratos />} />
        <Route path='usuarios' element={<UsuariosDashboard />} />
        <Route path='editar-perfil' element={<EditarPerfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
