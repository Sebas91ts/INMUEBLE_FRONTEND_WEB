// routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../pages/login'
import AdminRoutes from './AdminRoutes'
import UserRoutes from './UserRoutes'
import HomeUser from '../pages/HomeUser/HomeUser'
import Home from '../pages/HomeUser/ContentHomeUser'

export default function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  // Rutas protegidas solo para admin
  if (isAuthenticated && user?.grupo_id === 1) {
    return <AdminRoutes />
  }

  // Rutas públicas (cliente / Home) y login
  return (
    <Routes>
      {/* Layout del cliente */}
      <Route path='/' element={<HomeUser />}>
        <Route index element={<Home />} />
      </Route>

      <Route path='/login' element={<LoginForm />} />
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}

// ################################
// import { Routes, Route, Navigate } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import LoginForm from '../pages/login'
// import Dashboard from '../pages/Dashboard/Dashboard'
// import ProtectedRoute from '../components/ProtectedRoutes'
// import PrivilegedRoute from '../components/PrivilegedRoute'
// import EstadisticasDashboard from '../pages/Dashboard/components/EstadisticasDashboard'

// Ejemplo de páginas adicionales
// import InmueblesVenta from '../pages/Inmuebles/EnVenta'
// import InmueblesAlquiler from '../pages/Inmuebles/EnAlquiler'
// import InmueblesAnticretico from '../pages/Inmuebles/EnAnticretico'
// import ContratosCrear from '../pages/Contratos/Crear'
// import ContratosListar from '../pages/Contratos/Listar'
// import Chat from '../pages/Chat/Chat'
// import Bitacora from '../pages/Bitacora/Bitacora'

// function AppRoutes() {
//   const { isAuthenticated, loading } = useAuth()

//   if (loading) {
//     return (
//       <div className='flex items-center justify-center min-h-screen'>
//         <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
//       </div>
//     )
//   }

//   return (
//     <Routes>
//       <Route
//         path='/login'
//         element={!isAuthenticated ? <LoginForm /> : <Navigate to='/dashboard' />}
//       />

//       <Route
//         path='/dashboard'
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       >
//         {/* Default */}
//         <Route index element={<EstadisticasDashboard />} />
//         <Route path='estadisticas' element={<EstadisticasDashboard />} />

        {/* Inmuebles
        <Route
          path='inmuebles/venta'
          element={
            <PrivilegedRoute componente='inmueble'>
              <InmueblesVenta />
            </PrivilegedRoute>
          }
        />
        <Route
          path='inmuebles/alquiler'
          element={
            <PrivilegedRoute componente='inmueble'>
              <InmueblesAlquiler />
            </PrivilegedRoute>
          }
        />
        <Route
          path='inmuebles/anticretico'
          element={
            <PrivilegedRoute componente='inmueble'>
              <InmueblesAnticretico />
            </PrivilegedRoute>
          }
        />

        {/* Contratos */}
        {/* <Route
          path='contratos/crear'
          element={
            <PrivilegedRoute componente='contrato'>
              <ContratosCrear />
            </PrivilegedRoute>
          }
        />
        <Route
          path='contratos'
          element={
            <PrivilegedRoute componente='contrato'>
              <ContratosListar />
            </PrivilegedRoute>
          }
        />

        {/* Chat */}
        {/* <Route
          path='chat'
          element={
            <PrivilegedRoute componente='chat'>
              <Chat />
            </PrivilegedRoute>
          }
        /> */}

        {/* Bitácora */}
        {/* <Route
          path='bitacora'
          element={
            <PrivilegedRoute componente='bitacora'>
              <Bitacora />
            </PrivilegedRoute>
          }
        />
      </Route>  

      <Route
        path='/'
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
      />
    </Routes>
  )
}

export default AppRoutes */}
