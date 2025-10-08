import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePrivilegios } from "../hooks/usePrivilegios";

export default function PrivilegedRoute({ componente, children }) {
  const { user } = useAuth();
  const { privilegios, loading } = usePrivilegios();
  
  // Hooks siempre arriba
  const [redireccionar, setRedireccionar] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Solo redirige si no tiene permiso
      const tienePermiso = privilegios.some(
        (p) =>
          p.componente.toLowerCase() === componente.toLowerCase() &&
          (p.puede_crear || p.puede_actualizar || p.puede_eliminar || p.puede_leer || p.puede_activar)
      );

      if (!tienePermiso && user?.grupo_nombre?.toLowerCase() !== "administrador") {
        const timer = setTimeout(() => setRedireccionar(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, privilegios, componente, user]);

  if (loading) {
    return <div className="p-4 text-gray-500">Cargando permisos...</div>;
  }

  if (redireccionar) {
    return <Navigate to="/dashboard" replace />;
  }

  // Administrador tiene acceso total
  if (user?.grupo_nombre?.toLowerCase() === "administrador") {
    return children;
  }

  // Verificar permisos nuevamente para mostrar el mensaje
  const tienePermiso = privilegios.some(
    (p) =>
      p.componente.toLowerCase() === componente.toLowerCase() &&
      (p.puede_crear || p.puede_actualizar || p.puede_eliminar || p.puede_leer || p.puede_activar)
  );

  if (tienePermiso) {
    return children;
  }

  // Mensaje de acceso denegado
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center p-4 bg-red-100 border border-red-400 rounded">
        <h1 className="text-2xl font-bold text-red-700">Acceso denegado</h1>
        <p className="text-red-600 mt-1">
          No tienes permisos para acceder a este módulo. Serás redirigido al dashboard.
        </p>
      </div>
    </div>
  );
}
