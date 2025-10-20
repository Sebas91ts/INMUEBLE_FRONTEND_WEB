// src/pages/anuncios/AnuncioAdminDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnuncios } from '../../../hooks/useAnuncios';
import { getAnuncioById } from '../../../api/inmueble/anuncios';

// Función para normalizar URLs de fotos
const normalizeUrl = (url) => {
  if (!url) return null;
  const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}/${String(url).replace(/^\/+/, "")}`;
};

export default function AnuncioAdminDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anuncio, setAnuncio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  
  // Usar el hook de anuncios para las acciones
  const { cambiarPrioridad, cambiarEstado, activar, desactivar } = useAnuncios();

  useEffect(() => {
    const fetchAnuncio = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getAnuncioById(id);
        console.log('🔍 Respuesta completa:', response);
        
        if (response.status === 1) {
          setAnuncio(response.values.anuncio);
        } else {
          throw new Error(response.message || 'Error al cargar el anuncio');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching anuncio:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnuncio();
    }
  }, [id]);

  // Funciones para los botones
  const handleCambiarPrioridad = async (nuevaPrioridad) => {
    try {
      await cambiarPrioridad(anuncio.id, nuevaPrioridad);
      // Actualizar el estado local
      setAnuncio(prev => ({ ...prev, prioridad: nuevaPrioridad }));
      alert(`Prioridad cambiada a ${nuevaPrioridad}`);
    } catch (error) {
      alert('Error al cambiar prioridad');
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    try {
      await cambiarEstado(anuncio.id, nuevoEstado);
      setAnuncio(prev => ({ ...prev, estado: nuevoEstado }));
      alert(`Estado cambiado a ${nuevoEstado}`);
    } catch (error) {
      alert('Error al cambiar estado');
    }
  };

  const handleActivarDesactivar = async () => {
    try {
      if (anuncio.is_active) {
        await desactivar(anuncio.id);
        setAnuncio(prev => ({ ...prev, is_active: false }));
        alert('Anuncio desactivado');
      } else {
        await activar(anuncio.id);
        setAnuncio(prev => ({ ...prev, is_active: true }));
        alert('Anuncio activado');
      }
    } catch (error) {
      alert('Error al cambiar estado del anuncio');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando anuncio...</div>
      </div>
    );
  }

  if (error || !anuncio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">
            {error || 'Anuncio no encontrado'}
          </div>
          <button 
            onClick={() => navigate('/dashboard/anuncios')}
            className="text-blue-600 hover:text-blue-800"
          >
            Volver a anuncios
          </button>
        </div>
      </div>
    );
  }

  const { inmueble_info, agente_info } = anuncio;
  const fotos = (inmueble_info?.fotos || []).map(foto => ({
    ...foto,
    url: normalizeUrl(foto.url)
  })).filter(foto => foto.url);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con navegación */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard/anuncios')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a anuncios
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{inmueble_info?.titulo || 'Sin título'}</h1>
              <p className="text-gray-600 mt-2">
                {inmueble_info?.ciudad || 'Ciudad no especificada'}
                {inmueble_info?.zona ? `, ${inmueble_info.zona}` : ''}
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-4xl font-bold text-blue-600">
                ${inmueble_info?.precio ? Number(inmueble_info.precio).toLocaleString() : '0'}
              </p>
              <p className="text-sm text-gray-500 capitalize mt-1">
                Para {inmueble_info?.tipo_operacion || 'venta'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2">
            {/* Galería de fotos */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="relative aspect-[16/9] bg-gray-100">
                {fotos.length > 0 ? (
                  <img
                    src={fotos[currentPhoto]?.url}
                    alt={inmueble_info?.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {fotos.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentPhoto + 1} / {fotos.length}
                  </div>
                )}
              </div>

              {fotos.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {fotos.map((foto, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhoto(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        index === currentPhoto ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={foto.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información del inmueble */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información General</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p><strong>Dirección:</strong> {inmueble_info?.direccion || 'No especificada'}</p>
                  <p><strong>Ciudad:</strong> {inmueble_info?.ciudad || 'No especificada'}</p>
                  <p><strong>Zona:</strong> {inmueble_info?.zona || 'No especificada'}</p>
                </div>
                <div>
                  <p><strong>Tipo de Operación:</strong> {inmueble_info?.tipo_operacion || 'No especificado'}</p>
                  <p><strong>Tipo de Inmueble:</strong> {inmueble_info?.tipo_inmueble?.nombre || 'No especificado'}</p>
                  <p><strong>Descripción:</strong> {inmueble_info?.descripcion || 'No hay descripción disponible'}</p>
                </div>
              </div>
            </div>

            {/* Detalles del inmueble */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Detalles del Inmueble</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {inmueble_info?.dormitorios || '0'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Dormitorios</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {inmueble_info?.baños || '0'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Baños</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">
                    {inmueble_info?.superficie ? `${inmueble_info.superficie} m²` : '0 m²'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Superficie</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">
                    {inmueble_info?.tipo_inmueble?.nombre ? inmueble_info.tipo_inmueble.nombre.charAt(0).toUpperCase() + inmueble_info.tipo_inmueble.nombre.slice(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Tipo</div>
                </div>
              </div>

              {/* Coordenadas si existen */}
              {(inmueble_info?.latitud || inmueble_info?.longitud) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Ubicación</h3>
                  <p className="text-sm text-gray-600">
                    Lat: {inmueble_info.latitud || 'N/A'}, Long: {inmueble_info.longitud || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tarjeta del agente */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Agente Responsable</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {agente_info?.nombre ? 
                      agente_info.nombre.split(' ').map(n => n[0]).join('').toUpperCase() 
                      : 'AG'
                    }
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{agente_info?.nombre || 'No asignado'}</p>
                  <p className="text-sm text-gray-600">Agente</p>
                  {agente_info?.email && (
                    <p className="text-sm text-blue-600 mt-1">{agente_info.email}</p>
                  )}
                  {agente_info?.telefono && (
                    <p className="text-sm text-gray-600 mt-1">{agente_info.telefono}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Estado del anuncio */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Estado del Anuncio</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Publicación:</span>
                  <span className="font-medium text-gray-900">
                    {anuncio.fecha_publicacion ? 
                      new Date(anuncio.fecha_publicacion).toLocaleDateString() 
                      : 'No disponible'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    anuncio.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                    anuncio.estado === 'vendido' ? 'bg-red-100 text-red-800' :
                    anuncio.estado === 'alquilado' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {anuncio.estado || 'No especificado'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prioridad:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    anuncio.prioridad === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                    anuncio.prioridad === 'destacado' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {anuncio.prioridad || 'normal'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Activo:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    anuncio.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {anuncio.is_active ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones administrativas */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Editar Información
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Gestionar Fotos
                </button>
                
                {/* Cambiar Prioridad */}
                <div className="relative group">
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-blue-600">
                    Cambiar Prioridad
                  </button>
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {['normal', 'destacado', 'premium'].map(prioridad => (
                      <button
                        key={prioridad}
                        onClick={() => handleCambiarPrioridad(prioridad)}
                        disabled={anuncio.prioridad === prioridad}
                        className={`w-full text-left px-3 py-2 text-sm ${
                          anuncio.prioridad === prioridad 
                            ? 'bg-blue-50 text-blue-700 cursor-not-allowed' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cambiar Estado */}
                <div className="relative group">
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-blue-600">
                    Cambiar Estado
                  </button>
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {['disponible', 'vendido', 'alquilado', 'reservado'].map(estado => (
                      <button
                        key={estado}
                        onClick={() => handleCambiarEstado(estado)}
                        disabled={anuncio.estado === estado}
                        className={`w-full text-left px-3 py-2 text-sm ${
                          anuncio.estado === estado 
                            ? 'bg-blue-50 text-blue-700 cursor-not-allowed' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleActivarDesactivar}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 ${
                    anuncio.is_active ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {anuncio.is_active ? 'Desactivar Anuncio' : 'Activar Anuncio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}