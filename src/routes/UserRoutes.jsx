// routes/UserRoutes.jsx
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import HomeUser from "../pages/HomeUser/HomeUser";
import Home from "../pages/HomeUser/ContentHomeUser";
import PrivilegedRoute from "../components/PrivilegedRoute";

// ✅ añadidos: páginas reales para cliente
import Propiedades from "../pages/HomeUser/Propiedades";
import PropiedadDetail from "../pages/HomeUser/PropiedadDetail";

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeUser />}>
        {/* Página por defecto */}
        <Route index element={<Home />} />

        {/* Páginas públicas */}
        <Route path="nosotros" element={<div>Nosotros</div>} />
        <Route path="contacto" element={<div>Contacto</div>} />

        {/* Páginas protegidas por privilegios */}
        {/* Usamos un wrapper con Outlet para tener listado y detalle */}
        <Route
          path="propiedades"
          element={
            // ⚠️ Componente de privilegio: usa el que manejes en backend.
            // Si tus privilegios se llaman "Inmueble", déjalo así:
            <PrivilegedRoute componente="Inmueble">
              <Outlet />
            </PrivilegedRoute>
          }
        >
          {/* Listado */}
          <Route index element={<Propiedades />} />
          {/* Detalle */}
          <Route path=":id" element={<PropiedadDetail />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}
