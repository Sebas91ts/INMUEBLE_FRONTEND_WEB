import { useEffect, useState } from 'react'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Search,
  Loader2,
  MessageSquare
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getAgentes } from '../../api/usuarios/usuarios'
import { useAuth } from '../../hooks/useAuth'
import { createChat } from '../../api/chat/chat'
import LoginRequired from '../../components/LoginRequired'

export default function AgentesInmobiliaria() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, error, loading, execute } = useApi(getAgentes)
  const { execute: executeChat } = useApi(createChat)
  const { user } = useAuth()

  useEffect(() => {
    execute()
  }, [])

  const agentes = data?.data?.values || []

  const handleChat = async (agenteId) => {
    const result = await executeChat({
      agente: agenteId,
      cliente: user.id
    })
    console.log(result)
  }

  const agentesFiltrados = agentes.filter(
    (agente) =>
      agente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agente.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agente.telefono && agente.telefono.includes(searchTerm))
  )

  const getInitials = (nombre) =>
    nombre
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)

  const formatDate = (fecha) => {
    if (!fecha) return null
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const mensajeDefault = encodeURIComponent(
    '¡Hola! Estoy interesado en tus propiedades, ¿podrías brindarme más información?'
  )

  if (!user) return <LoginRequired />

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-stone-50'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-stone-700 mx-auto mb-4' />
          <p className='text-stone-600 text-lg'>Cargando agentes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-stone-50'>
        <div className='bg-white rounded-lg shadow-lg p-8 max-w-md'>
          <div className='text-red-500 text-center'>
            <p className='text-xl font-semibold mb-2'>
              Error al cargar agentes
            </p>
            <p className='text-stone-600'>{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-stone-900 mb-3'>
            Nuestros Agentes
          </h1>
          <p className='text-lg text-stone-600'>
            Profesionales dedicados a ayudarte a encontrar tu hogar ideal
          </p>
        </div>

        {/* Buscador */}
        <div className='mb-8'>
          <div className='relative max-w-xl mx-auto'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Buscar por nombre, correo o teléfono...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-stone-600 focus:border-transparent outline-none transition'
            />
          </div>
        </div>

        {/* Lista de agentes */}
        {agentesFiltrados.length === 0 ? (
          <div className='text-center py-12'>
            <User className='w-16 h-16 text-stone-400 mx-auto mb-4' />
            <p className='text-xl text-stone-600'>
              No se encontraron agentes disponibles
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {agentesFiltrados.map((agente) => (
              <div
                key={agente.id}
                className='bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300'
              >
                <div className='bg-gradient-to-r from-stone-700 to-stone-900 h-24 relative'>
                  <div className='absolute -bottom-12 left-1/2 transform -translate-x-1/2'>
                    <div className='w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white'>
                      <span className='text-2xl font-bold text-stone-800'>
                        {getInitials(agente.nombre)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='pt-16 pb-6 px-6'>
                  <div className='text-center mb-4'>
                    <h3 className='text-xl font-bold text-stone-900 mb-1'>
                      {agente.nombre}
                    </h3>
                    <p className='text-sm text-stone-500'>@{agente.username}</p>

                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        agente.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {agente.is_active ? 'Disponible' : 'Inactivo'}
                    </span>
                  </div>

                  <div className='space-y-3 text-sm'>
                    <div className='flex items-start gap-3'>
                      <Mail className='w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0' />
                      <a
                        href={`mailto:${agente.correo}`}
                        className='text-stone-700 hover:text-stone-900 transition'
                      >
                        {agente.correo}
                      </a>
                    </div>

                    {agente.telefono && (
                      <div className='flex items-center gap-3'>
                        <Phone className='w-4 h-4 text-stone-400 flex-shrink-0' />
                        <a
                          href={`tel:${agente.telefono}`}
                          className='text-stone-700 hover:text-stone-900 transition'
                        >
                          {agente.telefono}
                        </a>
                      </div>
                    )}

                    {agente.ubicacion && (
                      <div className='flex items-start gap-3'>
                        <MapPin className='w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0' />
                        <span className='text-stone-700'>
                          {agente.ubicacion}
                        </span>
                      </div>
                    )}

                    {agente.fecha_nacimiento && (
                      <div className='flex items-start gap-3'>
                        <Calendar className='w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0' />
                        <span className='text-stone-700'>
                          {formatDate(agente.fecha_nacimiento)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botón estilo marketplace */}
                  <button
                    onClick={() => handleChat(agente.id)}
                    className='mt-6 flex items-center justify-center gap-2 w-full rounded-md border border-stone-900 bg-stone-900 text-white font-medium py-2 px-4 transition-colors hover:bg-stone-800 focus:ring-2 focus:ring-stone-900 focus:ring-offset-2'
                  >
                    <MessageSquare className='w-4 h-4' />
                    <span>Enviar mensaje</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
