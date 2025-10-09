// routes/AdminRoutes.jsx
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoutes";
import PrivilegedRoute from "../components/PrivilegedRoute";

import Dashboard from "../pages/Dashboard/Dashboard";
import EstadisticasDashboard from "../pages/Dashboard/components/EstadisticasDashboard";
import SolicitudesAgentes from "../pages/SolicitudAgente/SolicitudAgente";
import Contratos from "../pages/Contratos/Contratos";
import UsuariosDashboard from "../pages/Usuarios/Usuarios";
import Bitacora from "../pages/Bitacora/Bitacora";

// === Inmuebles (listado por tipo + detalle) ===
import EnVenta from "../pages/inmuebles/EnVenta";
import EnAlquiler from "../pages/inmuebles/EnAlquiler";
import EnAnticretico from "../pages/inmuebles/EnAnticretico";
import InmuebleDetail from "../pages/inmuebles/InmuebleDetail";

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
        <Route path="estadisticas" element={<EstadisticasDashboard />} />

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

        {/* Otras apps (sin cambios) */}
        <Route path="solicitud-agente" element={<SolicitudesAgentes />} />
        <Route path="contratos" element={<Contratos />} />
        <Route path="usuarios" element={<UsuariosDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
