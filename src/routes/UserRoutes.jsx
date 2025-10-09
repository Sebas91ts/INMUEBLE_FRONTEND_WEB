import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import HomeUser from "../pages/HomeUser/HomeUser";
import Home from "../pages/HomeUser/ContentHomeUser";
import PrivilegedRoute from "../components/PrivilegedRoute";
import EditarPerfil from "../pages/Dashboard/components/EditarPerfil";
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
        <Route path="editar-perfil" element={<EditarPerfil />} />

        {/* Páginas protegidas por privilegios */}
        <Route
          path="propiedades"
          element={
            <PrivilegedRoute componente="Inmueble">
              <Outlet />
            </PrivilegedRoute>
          }
        >
          {/* ✅ Listado de propiedades */}
          <Route index element={<Propiedades />} />

          {/* ✅ Detalle de un inmueble */}
          <Route path=":id" element={<PropiedadDetail />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}
