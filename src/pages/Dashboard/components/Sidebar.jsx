import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import {
  Home,
  Users,
  Clipboard,
  Zap,
  Shield,
  MapPin,
  Wrench,
  DollarSign,
  ChevronRight,
  Menu,
  Building,
  User,
  LogOut,
  X,
  MessageSquare
} from 'lucide-react'

// AQUI SE AÑADEN LOS MENU DEL SIDEBAR
const menuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard' },
  {
    id: 'usuarios',
    icon: Users,
    label: 'Usuarios',
    subItems: [
      { id: 'copropietarios', label: 'Usuarios', path: '/dashboard/usuarios' },
      { id: 'personal', label: 'Personal', path: '/dashboard/personal' },
      { id: 'residentes', label: 'Residentes', path: '/dashboard/residentes' }
    ]
  },
  {
    id: 'unidades',
    icon: Building,
    label: 'Unidades',
    path: '/dashboard/unidades'
  },
  {
    id: 'areas',
    icon: MapPin,
    label: 'Áreas Comunes',
    path: '/dashboard/areas'
  },
  {
    id: 'Tareas',
    icon: Wrench,
    label: 'Tareas',
    path: '/dashboard/tareas'
  },
  {
    id: 'comunicados',
    icon: MessageSquare,
    label: 'Comunicados',
    path: '/dashboard/comunicados'
  },
  {
    id: 'finanzas',
    icon: DollarSign,
    label: 'Finanzas',
    path: '/dashboard/finanzas'
  },
  {
    id: 'smart',
    icon: Zap,
    label: 'Dispositivos IoT',
    path: '/dashboard/smart'
  },
  {
    id: 'bitacora',
    icon: Clipboard,
    label: 'Bitácora',
    path: '/dashboard/bitacora'
  }
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openSubMenu, setOpenSubMenu] = useState(null)
  //   const [activeSection, setActiveSection] = useState('dashboard')

  const navigate = useNavigate()

  const { user, logout } = useAuth()
  // Datos del contexto del usuario
  const userContext = user ? { ...user } : null

  const getUserDisplayName = () => {
    if (userContext.first_name || userContext.last_name) {
      return `${userContext.first_name || ''} ${
        userContext.last_name || ''
      }`.trim()
    }
    return userContext.username || 'Usuario'
  }
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
  return (
    <div
      className={`bg-white shadow-xl transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } flex flex-col`}
    >
      {/* Logo y Toggle */}
      <div className='p-6 border-b border-gray-200 flex items-center justify-between'>
        <div
          className={`flex items-center space-x-3 ${
            !sidebarOpen && 'justify-center'
          }`}
        >
          <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center'>
            <Building className='w-5 h-5 text-white' />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                SmartCondominio
              </h1>
              <p className='text-xs text-gray-500'>Administración</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
        >
          {sidebarOpen ? (
            <X className='w-4 h-4' />
          ) : (
            <Menu className='w-4 h-4' />
          )}
        </button>
      </div>

      {/* User Info */}
      <div className='p-4 border-b border-gray-100'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center'>
            <User className='w-5 h-5 text-white' />
          </div>
          {sidebarOpen && (
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {getUserDisplayName()}
              </p>
              <p className='text-xs text-gray-500 truncate'>
                {userContext.rol}
              </p>
              <p className='text-xs text-gray-400 truncate'>
                {userContext.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className='flex-1 p-4 space-y-2'>
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.subItems ? (
              <button
                onClick={() =>
                  setOpenSubMenu(openSubMenu === item.id ? null : item.id)
                }
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  openSubMenu === item.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                {sidebarOpen && (
                  <span className='font-medium'>{item.label}</span>
                )}
                {sidebarOpen && (
                  <ChevronRight
                    className={`w-4 h-4 ml-auto transition-transform ${
                      openSubMenu === item.id ? 'rotate-90' : ''
                    }`}
                  />
                )}
              </button>
            ) : (
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                {sidebarOpen && (
                  <span className='font-medium'>{item.label}</span>
                )}
              </NavLink>
            )}

            {/* Submenu */}
            {item.subItems && openSubMenu === item.id && sidebarOpen && (
              <div className='ml-8 mt-1 space-y-1'>
                {item.subItems.map((sub) => (
                  <NavLink
                    key={sub.id}
                    to={sub.path}
                    className={({ isActive }) =>
                      `w-full block px-3 py-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className='p-4 border-t border-gray-100'>
        <button
          className='w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all'
          onClick={handleLogout}
        >
          <LogOut className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
          {sidebarOpen && <span className='font-medium'>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  )
}
