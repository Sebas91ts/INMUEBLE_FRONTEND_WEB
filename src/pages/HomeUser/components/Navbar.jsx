import { Link, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { Menu, X, Home, Building2, Phone, Info, LogOut } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { usePrivilegios } from "../../../hooks/usePrivilegios";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { privilegios, loading } = usePrivilegios();
  const location = useLocation();

  // 🔹 Propiedades → público para que cualquiera lo vea como cliente
  const navLinks = useMemo(
    () => [
      {
        to: "/",
        label: "Inicio",
        icon: Home,
        componente: "Inicio",
        protegido: false,
      },
      {
        to: "/propiedades",
        label: "Propiedades",
        icon: Building2,
        componente: "Inmueble",
        protegido: false,
      },
      {
        to: "/nosotros",
        label: "Nosotros",
        icon: Info,
        componente: "Nosotros",
        protegido: false,
      },
      {
        to: "/contacto",
        label: "Contacto",
        icon: Phone,
        componente: "Contacto",
        protegido: false,
      },
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: Home,
        componente: "Dashboard",
        protegido: true,
      },
    ],
    []
  );

  if (loading)
    return <div className="p-4 text-gray-500">Cargando permisos...</div>;

  // Filtrar links según privilegios (solo para los protegidos)
  const linksFiltrados = navLinks.filter((link) => {
    if (!link.protegido) return true; // públicos
    if (!user) return false;
    if (user.grupo_nombre?.toLowerCase() === "administrador") return true;
    return privilegios.some(
      (p) =>
        p.componente.toLowerCase() === link.componente.toLowerCase() &&
        (p.puede_crear ||
          p.puede_actualizar ||
          p.puede_eliminar ||
          p.puede_leer ||
          p.puede_activar)
    );
  });

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  // 🔹 helper de estilos activos sin cambiar a NavLink
  const isActive = (to) => {
    // consideramos activo exacto para "/" y prefix para el resto
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };
  const baseLinkCls = "text-sm font-medium transition-colors";
  const activeCls = "text-stone-900";
  const inactiveCls = "text-stone-600 hover:text-stone-900";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <Building2 className="h-6 w-6 text-stone-900" />
            <span className="text-xl font-semibold tracking-tight text-stone-900">
              Elite Properties
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {linksFiltrados.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? "page" : undefined}
                className={`${baseLinkCls} ${
                  isActive(link.to) ? activeCls : inactiveCls
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Login / Logout */}
          <div className="hidden md:block">
            {user ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Cerrar Sesión
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-stone-900"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-stone-200 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {linksFiltrados.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 text-sm font-medium ${
                      active
                        ? "text-stone-900"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}

              {user && (
                <div className="p-4 border-t border-gray-100">
                  <button
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
