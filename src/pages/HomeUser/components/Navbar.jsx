import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useContext, useMemo, useEffect, useRef } from 'react'
import {
  Menu, X, Home, Building2, Users, Bell, TrendingUp, Calendar,
  FileText, MessageCircle, DollarSign, User, Activity, Map, ChevronDown,
  LogOut, LayoutDashboard, Briefcase
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { usePrivilegios } from '../../../hooks/usePrivilegios'
import { ChatContext } from '../../../contexts/ChatContext'
import UserAvatar from '../../Dashboard/components/UserAvatar'
import useAlertBadge from '../../../hooks/useAlertBadge'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // Estado para manejar qué dropdown está abierto en móvil/desktop
  const [activeDropdown, setActiveDropdown] = useState(null) 
  
  const { user, logout } = useAuth()
  const { privilegios, loading } = usePrivilegios()
  const { chats } = useContext(ChatContext)
  const navigate = useNavigate()
  const location = useLocation()
  const totalAlerts = useAlertBadge(user?.token, user?.grupo_nombre?.toLowerCase())

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú al cambiar ruta
  useEffect(() => { setIsMenuOpen(false); setActiveDropdown(null); }, [location.pathname])

  // Calcular mensajes no leídos
  const totalUnread = useMemo(() => {
    if (!user || !chats) return 0
    return chats.reduce((acc, chat) => {
      const otherUserId = chat.cliente.id === user.id ? chat.agente.id : chat.cliente.id
      const unreadFromOther = chat.mensajes.filter(m => !m.leido && m.usuario_id === otherUserId).length
      return acc + unreadFromOther
    }, 0)
  }, [chats, user])

  // --- 1. DEFINICIÓN DE GRUPOS DE MENÚ ---
  const menuGroups = [
    {
      id: 'main',
      title: 'Principal',
      type: 'flat', // Enlaces directos
      items: [
        { to: '/home', label: 'Inicio', icon: Home, componente: 'Inicio', protegido: false },
        { to: '/home/propiedades', label: 'Propiedades', icon: Building2, componente: 'Inmueble', protegido: false },
        { to: '/home/mapa', label: 'Mapa', icon: Map, componente: 'Inmueble', protegido: false }, // Mapa público/híbrido
        { to: '/home/agentes-contacto', label: 'Agentes', icon: Users, componente: 'Agente', protegido: false },
      ]
    },
    {
      id: 'gestion',
      title: 'Gestión',
      icon: Briefcase,
      type: 'dropdown', // Menú desplegable
      items: [
        { to: '/home/citas', label: 'Agenda', icon: Calendar, componente: 'cita', protegido: true },
        { to: '/home/contratos', label: 'Contrato Servicios', icon: FileText, componente: 'contrato', protegido: true },
        { to: '/home/contratos-page', label: 'Contratos Cliente', icon: FileText, componente: 'contrato', protegido: true },
        { to: '/home/reportes', label: 'Reportes', icon: Activity, componente: 'contrato', protegido: true },
      ]
    },
    {
      id: 'personal',
      title: 'Mi Espacio',
      icon: LayoutDashboard,
      type: 'dropdown',
      items: [
        { to: '/home/dashboard', label: 'Dashboard Admin', icon: Home, componente: 'Dashboard', protegido: true },
        { to: '/home/mis-inmuebles/aprobados', label: 'Mis Inmuebles', icon: Building2, componente: 'Inmueble', protegido: true },
        { to: '/home/desempeno', label: 'Desempeño', icon: TrendingUp, componente: 'inmueble', protegido: true },
        { to: '/home/comisiones', label: 'Mis Comisiones', icon: DollarSign, componente: 'contrato', protegido: true },
      ]
    }
  ];

  // --- 2. FILTRADO DE PERMISOS ---
  const tienePermiso = (item) => {
    if (!item.protegido) return true;
    if (!user) return false;
    if (user.grupo_nombre?.toLowerCase() === 'administrador') return true;
    
    // Regla especial para agentes
    if ((item.label === 'Mis Inmuebles' || item.label === 'Mis Comisiones') && user.grupo_nombre?.toLowerCase() !== 'agente') {
      return false;
    }

    return privilegios.some(p => 
      p.componente.toLowerCase() === item.componente.toLowerCase() &&
      (p.puede_crear || p.puede_actualizar || p.puede_eliminar || p.puede_leer || p.puede_activar)
    );
  };

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  if (loading) return <div className="h-16 bg-white border-b animate-pulse" />;

  return (
    <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      scrolled ? 'border-gray-200 bg-white shadow-md' : 'border-gray-200 bg-white/95 backdrop-blur'
    }`}>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          
          {/* --- LOGO --- */}
          <Link to='/' className='flex items-center gap-2 group flex-shrink-0'>
            <div className='w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform'>
              <Building2 className='h-5 w-5 text-white' />
            </div>
            <span className='text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent hidden xl:block'>
              Elite Properties
            </span>
          </Link>

          {/* --- NAVEGACIÓN DESKTOP (Organizada) --- */}
          <div className='hidden lg:flex items-center gap-1'>
            {menuGroups.map((group) => {
              // Filtramos los items válidos del grupo
              const validItems = group.items.filter(tienePermiso);
              if (validItems.length === 0) return null;

              // 1. Si es tipo FLAT (Links directos)
              if (group.type === 'flat') {
                return validItems.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-gray-50 text-gray-600 hover:text-blue-600 ${location.pathname === link.to ? 'text-blue-600 bg-blue-50' : ''}`}
                  >
                    {link.label}
                  </Link>
                ));
              }

              // 2. Si es tipo DROPDOWN (Menús desplegables)
              return (
                <div 
                  key={group.id} 
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(group.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-gray-50 text-gray-600 group-hover:text-blue-600`}>
                    {group.icon && <group.icon className="w-4 h-4" />}
                    {group.title}
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>

                  {/* Dropdown Panel */}
                  <div className={`absolute top-full left-0 w-56 pt-2 transition-all duration-200 origin-top-left ${
                    activeDropdown === group.id ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                  }`}>
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-1">
                      {validItems.map(link => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-blue-50 text-gray-700 hover:text-blue-700 ${location.pathname === link.to ? 'bg-blue-50 text-blue-700' : ''}`}
                        >
                          <link.icon className="w-4 h-4" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- ACCIONES DERECHA (Iconos + Perfil) --- */}
          <div className='hidden lg:flex items-center gap-2'>
            {user ? (
              <>
                {/* Bandeja de Iconos (Notificaciones y Mensajes) */}
                <div className="flex items-center gap-1 mr-2 border-r border-gray-200 pr-3">
                  <button onClick={() => navigate('/home/mis-notificaciones')} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors group">
                    <Bell className="w-5 h-5 group-hover:text-blue-600" />
                    {totalAlerts > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                  
                  <button onClick={() => navigate('/home/chat')} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors group">
                    <MessageCircle className="w-5 h-5 group-hover:text-blue-600" />
                    {totalUnread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                  </button>
                </div>

                {/* Perfil Usuario */}
                <div className="flex items-center gap-3 pl-1">
                  <UserAvatar user={user} className="w-8 h-8" />
                  <div className="text-xs hidden xl:block">
                    <p className="font-semibold text-gray-800 truncate max-w-[100px]">{user.nombre}</p>
                    <p className="text-gray-500 capitalize">{user.grupo_nombre}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to='/login'
                className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20'
              >
                <User className='h-4 w-4' />
                Entrar
              </Link>
            )}
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className='flex items-center gap-3 lg:hidden'>
            {/* Notificaciones Móvil (Acceso rápido) */}
            {user && (
               <button onClick={() => navigate('/home/mis-notificaciones')} className="relative p-2 text-gray-600">
                 <Bell className="w-6 h-6" />
                 {totalAlerts > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
               </button>
            )}
            
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='p-2 text-gray-700 hover:bg-gray-100 rounded-lg'>
              {isMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU MOVIL --- */}
      {isMenuOpen && (
        <div className='lg:hidden border-t border-gray-200 bg-white shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto'>
          <div className='p-4 space-y-4'>
            
            {/* Perfil Móvil */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <UserAvatar user={user} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{user.nombre}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            )}

            {/* Links Móvil (Acordeón simplificado) */}
            <div className="space-y-1">
              {menuGroups.map(group => {
                const validItems = group.items.filter(tienePermiso);
                if (validItems.length === 0) return null;

                return (
                  <div key={group.id} className="py-1">
                    {group.type === 'dropdown' && (
                      <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {group.title}
                      </div>
                    )}
                    {validItems.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg ${location.pathname === link.to ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        <link.icon className="w-5 h-5 text-gray-400" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* Botones Finales Móvil */}
            {user ? (
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                 <button onClick={() => navigate('/home/chat')} className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg text-gray-700 font-medium">
                    <MessageCircle className="w-5 h-5" /> Mensajes
                    {totalUnread > 0 && <span className="bg-blue-600 text-white text-xs px-2 rounded-full">{totalUnread}</span>}
                 </button>
                 <button onClick={handleLogout} className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg font-medium">
                    <LogOut className="w-5 h-5" /> Salir
                 </button>
              </div>
            ) : (
              <Link to='/login' className="block w-full text-center py-3 bg-blue-600 text-white font-bold rounded-xl">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}