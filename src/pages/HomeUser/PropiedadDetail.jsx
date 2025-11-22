// src/pages/HomeUser/PropiedadDetail.jsx
import { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInmuebleById } from '../../api/inmueble'
import { useApi } from '../../hooks/useApi'
import { createChat } from '../../api/chat/chat'
import { useAuth } from '../../hooks/useAuth'
import { ChatContext } from '../../contexts/ChatContext'
import LoginRequired from '../../components/LoginRequired'
import BotonComprar from "../../components/BotonComprar";

import {
  Loader2,
  MessageSquare,
  ArrowLeft,
  MapPin,
  Home,
  Calendar,
  Bath,
  Bed,
  Square
} from 'lucide-react'

// 🔧 Ajusta imágenes para mejor calidad según el proveedor
const tuned = (url, width = 1600, quality = 85) => {
  try {
    const u = new URL(url)
    const host = u.hostname

    // Unsplash
    if (host.includes('unsplash.com') || host.includes('images.unsplash.com')) {
      u.searchParams.set('auto', 'format')
      u.searchParams.set('fit', 'crop')
      u.searchParams.set('w', width)
      u.searchParams.set('q', quality)
      return u.toString()
    }

    // Cloudinary
    if (host.includes('res.cloudinary.com')) {
      const parts = u.pathname.split('/image/upload/')
      if (parts.length === 2) {
        u.pathname = `${parts[0]}/image/upload/w_${width},q_${quality}/${parts[1]}`
        return u.toString()
      }
    }

    return url
  } catch {
    return url
  }
}

export default function PropiedadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inmueble, setInmueble] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPhoto, setCurrentPhoto] = useState(0)

  const { user } = useAuth()
  const { agregarChat } = useContext(ChatContext)
  const { execute: executeChat, loading: chatLoading } = useApi(createChat)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const { data } = await getInmuebleById(id)
        // Se mantiene la lógica de extracción de datos robusta
        const inm = data?.values?.inmueble ?? data?.values ?? data
        setInmueble(inm)
      } catch (err) {
        console.error('Error cargando inmueble:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading)
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600 text-lg'>Cargando propiedad...</p>
        </div>
      </div>
    )

  if (!inmueble)
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <button
          onClick={() => navigate(-1)}
          className='flex items-center text-blue-600 hover:text-blue-800 mb-6'
        >
          <ArrowLeft className='w-5 h-5 mr-2' />
          Volver
        </button>
        <div className='bg-white rounded-2xl shadow-sm p-8 text-center'>
          <h2 className='text-xl font-medium text-gray-700 mb-2'>
            Propiedad no encontrada
          </h2>
          <p className='text-gray-500'>No se encontró el inmueble #{id}</p>
        </div>
      </div>
    )

  const fotos = inmueble.fotos || []
  const agenteId = inmueble.agente // Esto es solo el ID, no el objeto completo
  const anuncio = inmueble.anuncio || null

  // 📨 Crear chat con el agente
  const handleChat = async () => {
    if (!user) return

    try {
      const result = await executeChat({
        agente_id: agenteId,
        cliente_id: user.id
      })

      const chat = result.data?.values
      if (!chat) return

      agregarChat(chat)
      navigate(`/home/chat?chatId=${chat.id}`)
    } catch (error) {
      console.error('Error al crear chat:', error)
    }
  }

  if (!user) return <LoginRequired />

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header con navegación y título */}
        <div className='mb-6'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center text-blue-600 hover:text-blue-800 mb-4'
          >
            <ArrowLeft className='w-5 h-5 mr-2' />
            Volver
          </button>

          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                {inmueble.titulo}
              </h1>
              <div className='flex items-center text-gray-600 mt-2'>
                <MapPin className='w-5 h-5 mr-1' />
                <span>
                  {inmueble.direccion}, {inmueble.ciudad}
                </span>
              </div>
            </div>
            <div className='mt-4 md:mt-0 text-right'>
              <p className='text-4xl font-bold text-blue-600'>
                ${Number(inmueble.precio).toLocaleString()}
              </p>
              <p className='text-sm text-gray-500 capitalize mt-1'>
                Para {inmueble.tipo_operacion}
              </p>
            </div>
          </div>
        </div>


        {/* GALERÍA DE FOTOS - MÁXIMA PRIORIDAD VISUAL */}
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100'>
          <div className='relative aspect-[16/9] bg-gray-100'>
            {fotos.length > 0 ? (
              <>
                <img
                  // Mayor ancho y calidad por defecto para la imagen principal
                  src={tuned(fotos[currentPhoto]?.url, 1920, 90)}
                  alt={inmueble.titulo}
                  className='w-full h-full object-cover'
                />
                {fotos.length > 1 && (
                  <div className='absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm'>
                    {currentPhoto + 1} / {fotos.length}
                  </div>
                )}
              </>
            ) : (
              <div className='w-full h-full flex items-center justify-center text-gray-400'>
                <div className='text-center p-12'>
                  <Home className='w-16 h-16 mx-auto mb-2' />
                  <p>No hay imágenes disponibles</p>
                </div>
              </div>
            )}
          </div>

          {/* Miniaturas de navegación */}
          {fotos.length > 1 && (
            <div className='p-4 flex gap-2 overflow-x-auto border-t'>
              {fotos.map((foto, index) => (
                <button
                  key={foto.id || index}
                  onClick={() => setCurrentPhoto(index)}
                  className={`flex-shrink-0 w-24 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentPhoto
                      ? 'border-blue-600 ring-2 ring-blue-300 shadow-md'
                      : 'border-transparent opacity-75 hover:opacity-100 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={tuned(foto.url, 400)}
                    alt={`Foto ${index + 1}`}
                    className='w-full h-full object-cover'
                    loading='lazy'
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONTENEDOR PRINCIPAL - Ahora todo es de ancho completo */}
        <div className='grid grid-cols-1 gap-8'>
          {/* DETALLES Y DESCRIPCIÓN */}
          <div>
            {/* Características destacadas (Dormitorios, Baños, m²) */}
            <div className='bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                Características Principales
              </h2>

              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                <div className='text-center p-4 bg-blue-50 rounded-xl flex flex-col items-center justify-center'>
                  <Bed className='w-6 h-6 text-blue-600 mb-1' />
                  <div className='text-2xl font-bold text-blue-800'>
                    {inmueble.dormitorios || '0'}
                  </div>
                  <div className='text-sm text-gray-600 mt-1'>Dormitorios</div>
                </div>
                <div className='text-center p-4 bg-green-50 rounded-xl flex flex-col items-center justify-center'>
                  <Bath className='w-6 h-6 text-green-600 mb-1' />
                  <div className='text-2xl font-bold text-green-800'>
                    {inmueble.baños || '0'}
                  </div>
                  <div className='text-sm text-gray-600 mt-1'>Baños</div>
                </div>
                <div className='text-center p-4 bg-purple-50 rounded-xl flex flex-col items-center justify-center'>
                  <Square className='w-6 h-6 text-purple-600 mb-1' />
                  <div className='text-2xl font-bold text-purple-800'>
                    {inmueble.superficie ? `${inmueble.superficie}` : '0'}
                  </div>
                  <div className='text-sm text-gray-600 mt-1'>m²</div>
                </div>
                <div className='text-center p-4 bg-orange-50 rounded-xl flex flex-col items-center justify-center'>
                  <Home className='w-6 h-6 text-orange-600 mb-1' />
                  <div className='text-2xl font-bold text-orange-800 capitalize'>
                    {inmueble.tipo_inmueble?.nombre
                      ? inmueble.tipo_inmueble.nombre.split(' ')[0]
                      : 'N/A'}
                  </div>
                  <div className='text-sm text-gray-600 mt-1'>Tipo</div>
                </div>
              </div>
            </div>

            {/* Descripción detallada */}
            {inmueble.descripcion && (
              <div className='bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Descripción
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  {inmueble.descripcion}
                </p>
              </div>
            )}

            {/* Información General Adicional */}
            <div className='bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100'>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Información Adicional
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700'>
                <p>
                  <strong className='text-gray-900'>Dirección:</strong>{' '}
                  {inmueble.direccion}
                </p>
                <p>
                  <strong className='text-gray-900'>Ciudad:</strong>{' '}
                  {inmueble.ciudad}
                </p>
                <p>
                  <strong className='text-gray-900'>Tipo de Operación:</strong>
                  <span className='capitalize'> {inmueble.tipo_operacion}</span>
                </p>
                <p>
                  <strong className='text-gray-900'>Tipo de Inmueble:</strong>
                  <span className='capitalize'>
                    {' '}
                    {inmueble.tipo_inmueble?.nombre}
                  </span>
                </p>
                {inmueble.zona && (
                  <p>
                    <strong className='text-gray-900'>Zona:</strong>{' '}
                    {inmueble.zona}
                  </p>
                )}
              </div>
            </div>

            {/* Información del anuncio (Manteniendo solo si es necesario para el cliente) */}
            {anuncio && (
              <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Estado del Anuncio
                </h2>
                <div className='grid grid-cols-2 sm:grid-cols-2 gap-4'>
                  <div className='text-center p-4 bg-gray-50 rounded-xl'>
                    <div className='flex items-center justify-center mb-2'>
                      <Calendar className='w-5 h-5 text-gray-600 mr-2' />
                      <span className='text-sm font-medium text-gray-900'>
                        Publicación
                      </span>
                    </div>
                    <p className='text-gray-700'>
                      {anuncio.fecha_publicacion
                        ? new Date(
                            anuncio.fecha_publicacion
                          ).toLocaleDateString()
                        : 'No disponible'}
                    </p>
                  </div>
                  <div className='text-center p-4 bg-gray-50 rounded-xl'>
                    <span className='text-sm font-medium text-gray-900 block mb-2'>
                      Estado
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        anuncio.estado === 'disponible'
                          ? 'bg-green-100 text-green-800'
                          : anuncio.estado === 'vendido'
                          ? 'bg-red-100 text-red-800'
                          : anuncio.estado === 'alquilado'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {anuncio.estado || 'No especificado'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
{inmueble.tipo_operacion === "venta" && (
  <div className="mt-6">
    <BotonComprar inmuebleId={inmueble.id} />
  </div>
)}
          {/* TARJETA DE CONTACTO (Antes Sidebar) - Ahora de ancho completo al final */}
          <div className='bg-white rounded-2xl shadow-lg p-6 sticky bottom-4 z-10 md:static border-t md:border-t-0 border-blue-200'>
            <h3 className='text-2xl font-bold text-gray-900 mb-4'>
              ¡Contáctanos! 💬
            </h3>
            <p className='text-gray-600 text-lg mb-6'>
              ¿Te interesa esta propiedad? Contacta a nuestro agente
              especializado para programar una visita o resolver tus dudas.
            </p>

            {/* Botón de Contacto */}
            <button
              onClick={handleChat}
              disabled={chatLoading || !agenteId}
              className='w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold py-4 px-6 text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'
            >
              {chatLoading ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <MessageSquare className='w-5 h-5' />
              )}
              <span>
                {chatLoading ? 'Abriendo chat...' : 'Hablar con el Agente'}
              </span>
            </button>

            {/* Mensaje de Agente no Asignado */}
            {!agenteId && (
              <p className='text-sm text-red-500 text-center mt-3'>
                ⚠️ En este momento no hay un agente asignado.
              </p>
            )}

            {/* Información adicional de venta */}
            <div className='mt-8 border-t pt-4'>
              <h3 className='font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider'>
                Beneficios de contactar:
              </h3>
              <div className='space-y-3 text-sm text-gray-600'>
                <div className='flex items-start'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0'></div>
                  <span>**Respuesta rápida** garantizada en minutos.</span>
                </div>
                <div className='flex items-start'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0'></div>
                  <span>**Visitas flexibles** según tu calendario.</span>
                </div>
                <div className='flex items-start'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0'></div>
                  <span>
                    **Asesoramiento legal y financiero** sin compromiso.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
