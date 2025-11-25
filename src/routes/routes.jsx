// routes/routes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../pages/login";
import AdminRoutes from "./AdminRoutes";
import UserRoutes from "./UserRoutes"; // ⬅️ usamos el router público completo
import Success from "../pages/Success";
import Comprobante from "../pages/Comprobante";
import PagoExito from "../components/PagoExito";
import PagoCancelado from "../components/PagoCancelado";
export default function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 👇 Si es admin, enviamos todo al router del dashboard (que ya maneja /dashboard/*)
  if (isAuthenticated && user?.grupo_nombre === 'administrador') {
    return <AdminRoutes />;
  }

  // 👇 Público (cliente): montamos TODAS las rutas de UserRoutes en /*
  return (
    <Routes>
      {/* Ruta pública para Stripe */}
      <Route path="/success" element={<Success />} />
      <Route path="/comprobante" element={<Comprobante />} />
      <Route path="/home/pago/exito/:pagoId" element={<PagoExito />} />
      <Route path="/home/pago/cancelado/:pagoId" element={<PagoCancelado />} />
      {/* Layout del cliente */}
      <Route path='/home/*' element={<UserRoutes />} />
      <Route path='/login' element={<LoginForm />} />
      <Route path='*' element={<Navigate to='/home' />} />
    </Routes>
  );
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

{
  /* Inmuebles
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

        {/* Contratos */
}
{
  /* <Route
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

        {/* Chat */
}
{
  /* <Route
          path='chat'
          element={
            <PrivilegedRoute componente='chat'>
              <Chat />
            </PrivilegedRoute>
          }
        /> */
}

{
  /* Bitácora */
}
{
  /* <Route
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

export default AppRoutes */
}
