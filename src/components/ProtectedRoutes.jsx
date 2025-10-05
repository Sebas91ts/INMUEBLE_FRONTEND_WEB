import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  //HABILITAR CUANDO ESTEN BIEN CONFIGURADOS LOS GRUPOS
  // if (user.grupo_id !== 1) {
  //   return (
  //     <div className='flex items-center justify-center min-h-screen'>
  //       <div className='flex flex-col items-center'>
  //         <h1 className='text-2xl font-bold text-gray-900'>Acceso denegado</h1>
  //         <p className='text-gray-600 mt-1'>
  //           No tienes permiso para acceder a esta ruta.
  //         </p>
  //       </div>
  //     </div>
  //   )
  // }

  return children
}

export default ProtectedRoute
