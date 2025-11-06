// src/pages/HomeUser/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useContext, useMemo, useEffect } from 'react'
import {
  Menu,
  X,
  Home,
  Building2,
  Phone,
  Info,
  LogOut,
  Users,
  Bell,
  TrendingUp,
  Calendar,
  FileText,
  MessageCircle,
  DollarSign,
  User,
  Activity,
  PlusCircle
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { usePrivilegios } from '../../../hooks/usePrivilegios'
import { ChatContext } from '../../../contexts/ChatContext'
import UserAvatar from '../../Dashboard/components/UserAvatar'
import useAlertBadge from '../../../hooks/useAlertBadge' // <<< HOOK DE ALERTAS >>>

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const { privilegios, loading } = usePrivilegios()
  const { chats } = useContext(ChatContext)
  const navigate = useNavigate()
  const location = useLocation()
  const totalAlerts = useAlertBadge(user?.token, user?.grupo_nombre?.toLowerCase()) // <<< USO DEL HOOK >>>

  // Detectar scroll para cambiar estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // 🔢 Calcular cantidad total de mensajes no leídos del otro usuario
  const totalUnread = useMemo(() => {
    if (!user || !chats) return 0
    return chats.reduce((acc, chat) => {
      const otherUserId =
        chat.cliente.id === user.id ? chat.agente.id : chat.cliente.id
      const unreadFromOther = chat.mensajes.filter(
        (msg) => !msg.leido && msg.usuario_id === otherUserId
      ).length
      return acc + unreadFromOther
    }, 0)
  }, [chats, user])

  const navLinks = [
    {
      to: '/home',
      label: 'Inicio',
      icon: Home,
      componente: 'Inicio',
      protegido: false
    },
    {
      to: '/home/propiedades',
      label: 'Propiedades',
      icon: Building2,
      componente: 'Inmueble',
      protegido: false
    },
    {
      to: '/home/dashboard',
      label: 'Dashboard',
      icon: Home,
      componente: 'Dashboard',
      protegido: true
    },
    {
      to: '/home/agentes-contacto',
      label: 'Agentes',
      icon: Users,
      componente: 'Agente',
      protegido: false
    },
    {
      to: '/home/chat',
      label: 'Mensajes',
      icon: MessageCircle,
      componente: 'chat',
      protegido: true
    },
    {
      to: '/home/mis-inmuebles/aprobados',
      label: 'Mis Inmuebles',
      icon: Building2,
      componente: 'Inmueble',
      protegido: true
    },
    {
      to: '/home/desempeno',
      label: 'Desempeño',
      icon: TrendingUp,
      componente: 'inmueble',
      protegido: true
    },
    
    {
      to: '/home/citas',
      label: 'Agenda',
      icon: Calendar,
      componente: 'cita',
      protegido: true
    },
    {
      to: '/home/contratos',
      label: 'Contrato Servicios',
      icon: FileText,
      componente: 'contrato',
      protegido: true
    },
    {
      to: '/home/contratos-page', 
      label: 'Contratos Cliente',
      icon: FileText, // Cambiado
      componente: 'contrato',
      protegido: true
    },
    {
      to: '/home/mis-notificaciones', // <<< RUTA DE NOTIFICACIONES >>>
      label: 'Notificaciones',
      icon: Bell,
      componente: 'ALERTA', 
      protegido: false
    },
    {
      to: '/home/comisiones',
      label: 'Mis Comisiones',
      icon: DollarSign,
      componente: 'contrato',
      protegido: true
    },
    
    {
      to: '/home/reportes', 
      label: 'Reportes',
      icon: Activity, // Cambiado
      componente: 'contrato',
      protegido: true
    },

    
  ]

  if (loading) {
    return (
      <nav className='sticky top-0 z-50 w-full border-b border-gray-200 bg-white'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='h-6 w-40 bg-gray-200 animate-pulse rounded'></div>
            <div className='h-6 w-32 bg-gray-200 animate-pulse rounded'></div>
          </div>
        </div>
      </nav>
    )
  }

  // Filtrar links según privilegios
  const linksFiltrados = navLinks.filter((link) => {
    if (!link.protegido) return true
    if (!user) return false

    // 🧩 Solo mostrar "Mis Inmuebles" si el usuario es agente
    if (
      (link.label === 'Mis Inmuebles' || link.label === 'Mis Comisiones') &&
      user.grupo_nombre?.toLowerCase() !== 'agente'
    ) {
      return false
    }

    // 🧩 El administrador ve todo
    if (user.grupo_nombre?.toLowerCase() === 'administrador') return true

    // 🧩 Verificar privilegios normales
    return privilegios.some(
      (p) =>
        p.componente.toLowerCase() === link.componente.toLowerCase() &&
        (p.puede_crear ||
          p.puede_actualizar ||
          p.puede_eliminar ||
          p.puede_leer ||
          p.puede_activar)
    )
  })

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  const isActiveLink = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    )
  }

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? 'border-gray-200 bg-white shadow-md'
          : 'border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80'
      }`}
    >
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2 group'>
            <div className='w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform'>
              <Building2 className='h-5 w-5 text-white' />
            </div>
            <span className='text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent hidden sm:block'>
              Elite Properties
            </span>
            <span className='text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent sm:hidden'>
              Elite
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden lg:flex items-center gap-1'>
            {linksFiltrados.map((link) => {
              const isChat = link.to === '/home/chat'
              const isAlerts = link.to === '/home/mis-notificaciones' // <<< AGREGADO PARA ESCRITORIO >>>
              const isActive = isActiveLink(link.to)

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className='flex items-center gap-2'>
                    {link.label}
                    {/* 🔴 Badge en desktop para chat */}
                    {isChat && totalUnread > 0 && (
                      <span className='inline-flex items-center justify-center rounded-full bg-red-600 w-5 h-5 text-xs font-bold text-white'>
                        {totalUnread > 99 ? '99+' : totalUnread}
                      </span>
                    )}
                    {/* 🔔 Badge en desktop para Notificaciones del Sistema */}
                    {isAlerts && totalAlerts > 0 && (
                      <span className='inline-flex items-center justify-center rounded-full bg-blue-600 w-5 h-5 text-xs font-bold text-white'>
                        {totalAlerts > 99 ? '99+' : totalAlerts}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full'></span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop User Menu */}
          <div className='hidden lg:flex items-center gap-3'>
            {user ? (
              <>
                {/* Badge de Alertas en el menú de usuario (Opcional, pero útil) */}
                {totalAlerts > 0 && (
                  <Link
                    to='/home/mis-notificaciones'
                    className='relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors'
                  >
                    <Bell className='h-5 w-5' />
                    <span className='absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center'>
                      {totalAlerts > 9 ? '9+' : totalAlerts}
                    </span>
                  </Link>
                )}

                <UserAvatar user={user} />
                <button
                  onClick={handleLogout}
                  className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white transition-all hover:from-red-700 hover:to-red-800 hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30'
                >
                  <LogOut className='h-4 w-4' />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to='/login'
                className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30'
              >
                <User className='h-4 w-4' />
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className='flex items-center gap-3 lg:hidden'>
            {/* 🔔 Campana de Notificaciones del Sistema (Prioridad en Móvil) */}
            {user && (
              <button
                  onClick={() => navigate('/home/mis-notificaciones')} 
                  className='relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
                  aria-label='Ir a notificaciones'
              >
                  <Bell className='h-5 w-5' />
                  {totalAlerts > 0 && (
                      <span className='absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                          {totalAlerts > 9 ? '9+' : totalAlerts}
                      </span>
                  )}
              </button>
            )}
            
            {/* 💬 Ícono de Chat (Separado de la Campana) */}
            {user && totalUnread > 0 && (
              <button
                  onClick={() => navigate('/home/chat')}
                  className='relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
                  aria-label='Ir a mensajes'
              >
                  <MessageCircle className='h-5 w-5' /> 
                  <span className='absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                      {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
              </button>
            )}

            {/* Botón del menú hamburguesa */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
              aria-label='Toggle menu'
            >
              {isMenuOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className='lg:hidden border-t border-gray-200 bg-white shadow-lg'>
            <div className='max-h-[calc(100vh-4rem)] overflow-y-auto py-4'>
              {/* User Info Mobile */}
              {user && (
                <div className='px-4 pb-4 mb-4 border-b border-gray-200'>
                  <div className='flex items-center gap-3'>
                    <UserAvatar user={user} />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-gray-900 truncate'>
                        {user.nombre || 'Usuario'}
                      </p>
                      <p className='text-xs text-gray-500 truncate'>
                        {user.email || ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className='flex flex-col gap-1 px-2'>
                {linksFiltrados.map((link) => {
                  const Icon = link.icon
                  const isChat = link.to === '/home/chat'
                  const isAlerts = link.to === '/home/mis-notificaciones'
                  const isActive = isActiveLink(link.to)

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className='h-5 w-5 flex-shrink-0' />
                      <span className='flex-1'>{link.label}</span>

                      {/* 🔴 Badge en menú móvil */}
                      {isChat && totalUnread > 0 && (
                        <span className='bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5'>
                          {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                      )}
                      {isAlerts && totalAlerts > 0 && ( // <<< BADGE DE ALERTS >>>
                        <span className='bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5'>
                          {totalAlerts > 99 ? '99+' : totalAlerts}
                        </span>
                      )}

                      {isActive && (
                        <span className='absolute right-4 w-1 h-8 bg-blue-600 rounded-full'></span>
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Logout Button Mobile */}
              {user ? (
                <div className='px-2 pt-4 mt-4 border-t border-gray-200'>
                  <button
                    className='w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all font-medium shadow-lg'
                    onClick={handleLogout}
                  >
                    <LogOut className='w-5 h-5' />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <div className='px-2 pt-4 mt-4 border-t border-gray-200'>
                  <Link
                    to='/login'
                    className='w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all font-semibold shadow-lg'
                  >
                    <User className='w-5 h-5' />
                    <span>Iniciar Sesión</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay para cerrar el menú */}
      {isMenuOpen && (
        <div
          className='fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden -z-10'
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  )
}