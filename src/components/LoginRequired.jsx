import { Lock, ArrowRight } from 'lucide-react'

export default function LoginRequired() {
  const handleLogin = () => {
    window.location.href = '/login'
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-stone-50'>
      <div className='relative'>
        {/* Círculos decorativos de fondo */}
        <div className='absolute -top-10 -left-10 w-40 h-40 bg-stone-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse'></div>
        <div
          className='absolute -bottom-10 -right-10 w-40 h-40 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse'
          style={{ animationDelay: '1s' }}
        ></div>

        {/* Tarjeta principal */}
        <div className='relative bg-white rounded-lg shadow-2xl p-10 max-w-md text-center border border-stone-200'>
          {/* Ícono */}
          <div className='inline-flex items-center justify-center w-20 h-20 bg-stone-900 rounded-full mb-6 shadow-lg'>
            <Lock className='w-10 h-10 text-white' />
          </div>

          {/* Título */}
          <h2 className='text-3xl font-bold text-stone-900 mb-3 tracking-tight'>
            Acceso Restringido
          </h2>

          {/* Descripción */}
          <p className='text-stone-600 mb-8 text-lg'>
            Necesitas iniciar sesión para acceder a esta sección y ver el
            contenido exclusivo.
          </p>

          {/* Botón */}
          <button
            onClick={handleLogin}
            className='group relative w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-3 px-6 rounded-md transition-all duration-300 transform hover:shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2'
          >
            <span>Iniciar Sesión</span>
            <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' />
          </button>

          {/* Texto adicional */}
          <p className='mt-6 text-sm text-stone-600'>
            ¿No tienes una cuenta?{' '}
            <a
              href='/registro'
              className='text-orange-600 hover:text-orange-700 font-semibold hover:underline'
            >
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
