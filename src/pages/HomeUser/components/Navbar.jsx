// src/pages/HomeUser/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useState, useContext, useMemo } from 'react'
import {
  Menu,
  X,
  Home,
  Building2,
  Phone,
  Info,
  LogOut,
  Users,
  Bell, TrendingUp,
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { usePrivilegios } from '../../../hooks/usePrivilegios'
import { ChatContext } from '../../../contexts/ChatContext'
import UserAvatar from '../../Dashboard/components/UserAvatar'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { privilegios, loading } = usePrivilegios()
  const { chats } = useContext(ChatContext)
  const navigate = useNavigate()

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
      to: '/home/nosotros',
      label: 'Nosotros',
      icon: Info,
      componente: 'Nosotros',
      protegido: false
    },
    {
      to: '/home/contacto',
      label: 'Contacto',
      icon: Phone,
      componente: 'Contacto',
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
      icon: Phone,
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
      to: '/home/desempeno',          // ← tu ruta (si es top-level)
      label: 'Desempeño',
      icon: TrendingUp,
      componente: 'inmueble',    // o 'desempeno' si creas un componente con ese nombre
      protegido: true,
      onlyAgente: true           // (opcional) muéstralo solo a agentes
    },
    
  ]

  if (loading)
    return <div className='p-4 text-gray-500'>Cargando permisos...</div>

  // Filtrar links según privilegios
  // const linksFiltrados = navLinks.filter((link) => {
  //   if (!link.protegido) return true
  //   if (!user) return false
  //   if (user.grupo_nombre?.toLowerCase() === 'administrador') return true

  //   // Links públicos → siempre mostrar
  //   if (!link.protegido) return true

  //   if (!user) return false
  //   if (user.grupo_nombre?.toLowerCase() === 'administrador') return true // Admin ve todo

  //   // Revisar privilegios solo para links protegidos
  //   return privilegios.some(
  //     (p) =>
  //       p.componente.toLowerCase() === link.componente.toLowerCase() &&
  //       (p.puede_crear ||
  //         p.puede_actualizar ||
  //         p.puede_eliminar ||
  //         p.puede_leer ||
  //         p.puede_activar)
  //   )
  // })

  // Filtrar links según privilegios
const linksFiltrados = navLinks.filter((link) => {
  if (!link.protegido) return true;
  if (!user) return false;

  // 🧩 Solo mostrar "Mis Inmuebles" si el usuario es agente
  if (link.label === "Mis Inmuebles" && user.grupo_nombre?.toLowerCase() !== "agente") {
    return false;
  }

  // 🧩 El administrador ve todo
  if (user.grupo_nombre?.toLowerCase() === "administrador") return true;

  //  Agente
  if (link.onlyAgente && user.grupo_nombre?.toLowerCase() !== 'agente') {
    return false;
  }
  // 🧩 Verificar privilegios normales
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
    await logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className='sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2'>
            <Building2 className='h-6 w-6 text-stone-900' />
            <span className='text-xl font-semibold tracking-tight text-stone-900'>
              Elite Properties
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden items-center gap-8 md:flex'>
            {linksFiltrados.map((link) => {
              const isChat = link.to === '/home/chat'
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className='relative text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 flex items-center gap-1'
                >
                  {link.label}
                  {/* 🔴 Badge en desktop para chat */}
                  {isChat && totalUnread > 0 && (
                    <span className='ml-1 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold leading-none text-white'>
                      {totalUnread}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop Login / Logout */}
          <div className='hidden md:block'>
            {user ? (
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleLogout}
                  className='inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2'
                >
                  Cerrar Sesión
                </button>
                <UserAvatar user={user} />
              </div>
            ) : (
              <Link
                to='/login'
                className='inline-flex items-center justify-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2'
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* 🔔 Campanita y botón del menú (solo en móvil) */}
          <div className='flex items-center gap-3 md:hidden'>
            <button
              onClick={() => navigate('/home/chat')}
              className='relative text-stone-900'
              aria-label='Ir a mensajes'
            >
              <Bell className='h-6 w-6' />
              {totalUnread > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5'>
                  {totalUnread}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='text-stone-900'
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='border-t border-stone-200 py-4 md:hidden'>
            <div className='flex flex-col gap-4'>
              {linksFiltrados.map((link) => {
                const Icon = link.icon
                const isChat = link.to === '/home/chat'

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className='relative flex items-center gap-3 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900'
                  >
                    <Icon className='h-4 w-4' />
                    {link.label}

                    {/* 🔴 Badge en menú móvil */}
                    {isChat && totalUnread > 0 && (
                      <span className='absolute right-0 top-0 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5'>
                        {totalUnread}
                      </span>
                    )}
                  </Link>
                )
              })}

              {user && (
                <div className='p-4 border-t border-gray-100'>
                  <button
                    className='w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all'
                    onClick={handleLogout}
                  >
                    <LogOut className='w-5 h-5' />
                    <span className='font-medium'>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
