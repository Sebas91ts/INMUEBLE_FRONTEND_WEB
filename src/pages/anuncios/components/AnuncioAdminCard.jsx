// src/pages/anuncios/components/AnuncioAdminCard.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AnuncioAdminCard({ 
  data, 
  anuncio, 
  onGestionar, 
  onPrioridad, 
  onEstado, 
  onActivarDesactivar,
  showAcciones = true 
}) {
  const fotos = Array.isArray(data?.fotos) ? data.fotos : [];
  const hero = fotos.length ? fotos[0].url : null;
  const [menuAbierto, setMenuAbierto] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extraer información del anuncio si está disponible
  const estadoAnuncio = anuncio?.estado || 'disponible';
  const prioridadAnuncio = anuncio?.prioridad || 'normal';
  const isActive = anuncio?.is_active ?? true;
  const agente = anuncio?.agente_info?.nombre || 'Sin asignar';
  const fechaPublicacion = anuncio?.fecha_publicacion ? new Date(anuncio.fecha_publicacion).toLocaleDateString() : 'No publicada';

  // Formatear dirección completa
  const getDireccionCompleta = () => {
    const parts = [];
    if (data.direccion && data.direccion !== 'Sin dirección') parts.push(data.direccion);
    if (data.ciudad) parts.push(data.ciudad);
    if (data.provincia) parts.push(data.provincia);
    return parts.length > 0 ? parts.join(', ') : 'Sin dirección';
  };

  const getBadgeEstado = (estado) => {
    const config = {
      disponible: { clase: 'bg-emerald-50 text-emerald-700', label: 'Disponible' },
      vendido: { clase: 'bg-rose-50 text-rose-700', label: 'Vendido' },
      alquilado: { clase: 'bg-sky-50 text-sky-700', label: 'Alquilado' },
      reservado: { clase: 'bg-amber-50 text-amber-700', label: 'Reservado' }
    }
    const cfg = config[estado] || { clase: 'bg-gray-50 text-gray-700', label: estado }
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${cfg.clase}`}>
        {cfg.label}
      </span>
    )
  }

  const getBadgePrioridad = (prioridad) => {
    const config = {
      premium: { clase: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700', label: 'Premium' },
      destacado: { clase: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700', label: 'Destacado' },
      normal: { clase: 'bg-gray-50 text-gray-700', label: 'Normal' }
    }
    const cfg = config[prioridad] || config.normal
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${cfg.clase}`}>
        {cfg.label}
      </span>
    )
  }

  const toggleMenu = (menu) => {
    setMenuAbierto(menuAbierto === menu ? null : menu);
  }

  const handleVerDetalles = () => {
    if (anuncio?.id) {
      // Navegar a la vista detalle del anuncio
      navigate(`/dashboard/anuncios/detalle/${anuncio.id}`);
    } else {
      // Si no tiene anuncio, mostrar detalles del inmueble
      navigate(`/dashboard/inmuebles/${data.id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 min-h-[550px] flex flex-col">
      {/* Imagen con botón de ver detalles */}
      <div className="relative">
        {hero ? (
          <img
            src={hero}
            alt={data.titulo}
            className="w-full h-48 object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 grid place-items-center text-gray-400 flex-shrink-0">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <button
          onClick={handleVerDetalles}
          className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
        >
          Ver Detalles
        </button>
      </div>
      
      {/* Contenido */}
      <div className="p-6 flex-grow flex flex-col">
        {/* Información básica */}
        <div className="flex-grow">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-2 line-clamp-2">
            {data.titulo || 'Sin título'}
          </h3>
          
          {/* Dirección mejorada */}
          <div className="text-gray-600 text-sm mb-3">
            <div className="flex items-start space-x-1">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-2">{getDireccionCompleta()}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-blue-600 text-lg">
              ${Number(data?.precio || 0).toLocaleString()}
            </p>
            {data?.tipo_operacion && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium capitalize">
                {data.tipo_operacion}
              </span>
            )}
          </div>

          {/* Características del inmueble */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            {data.dormitorios != null && (
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="font-semibold text-gray-900">{data.dormitorios}</div>
                <div className="text-gray-600 text-xs">Dorm.</div>
              </div>
            )}
            {data.baños != null && (
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="font-semibold text-gray-900">{data.baños}</div>
                <div className="text-gray-600 text-xs">Baños</div>
              </div>
            )}
            {data.superficie != null && (
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="font-semibold text-gray-900">{data.superficie}</div>
                <div className="text-gray-600 text-xs">m²</div>
              </div>
            )}
          </div>

          {/* Estados y prioridad */}
          <div className="flex flex-wrap gap-2 mb-4">
            {anuncio && (
              <>
                {getBadgeEstado(estadoAnuncio)}
                {getBadgePrioridad(prioridadAnuncio)}
                {!isActive && (
                  <span className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    Inactivo
                  </span>
                )}
              </>
            )}
            {!anuncio && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                Sin anuncio
              </span>
            )}
          </div>

          {/* Información adicional del anuncio - Mejorado */}
          {anuncio && (
            <div className="text-sm text-gray-600 mb-4 space-y-2 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Agente:</span>
                <span className="text-gray-900 text-right">{agente}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Publicado:</span>
                <span className="text-gray-900">{fechaPublicacion}</span>
              </div>
            </div>
          )}
        </div>

        {/* Acciones - Menús desplegables elegantes */}
        {showAcciones && (
          <div className="space-y-3 border-t border-gray-100 pt-4" ref={menuRef}>
            {anuncio ? (
              // Acciones para anuncios existentes
              <div className="space-y-3">
                {/* Prioridad */}
                <div className="relative">
                  <button
                    onClick={() => toggleMenu('prioridad')}
                    className="w-full py-2.5 px-4 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <span>Cambiar Prioridad</span>
                    <svg className={`w-4 h-4 transition-transform ${menuAbierto === 'prioridad' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuAbierto === 'prioridad' && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 z-20 p-2">
                      <div className="space-y-1">
                        {[
                          { value: 'normal', label: 'Normal', active: prioridadAnuncio === 'normal' },
                          { value: 'destacado', label: 'Destacado', active: prioridadAnuncio === 'destacado' },
                          { value: 'premium', label: 'Premium', active: prioridadAnuncio === 'premium' }
                        ].map(({ value, label, active }) => (
                          <button
                            key={value}
                            onClick={() => {
                              onPrioridad?.(anuncio.id, value);
                              setMenuAbierto(null);
                            }}
                            disabled={active}
                            className={`w-full py-2 px-3 rounded-lg text-sm text-left transition-colors ${
                              active
                                ? 'bg-blue-50 text-blue-700 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Estado */}
                <div className="relative">
                  <button
                    onClick={() => toggleMenu('estado')}
                    className="w-full py-2.5 px-4 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <span>Cambiar Estado</span>
                    <svg className={`w-4 h-4 transition-transform ${menuAbierto === 'estado' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuAbierto === 'estado' && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 z-20 p-2">
                      <div className="space-y-1">
                        {[
                          { value: 'disponible', label: 'Disponible', active: estadoAnuncio === 'disponible' },
                          { value: 'vendido', label: 'Vendido', active: estadoAnuncio === 'vendido' },
                          { value: 'alquilado', label: 'Alquilado', active: estadoAnuncio === 'alquilado' },
                          { value: 'reservado', label: 'Reservado', active: estadoAnuncio === 'reservado' }
                        ].map(({ value, label, active }) => (
                          <button
                            key={value}
                            onClick={() => {
                              onEstado?.(anuncio.id, value);
                              setMenuAbierto(null);
                            }}
                            disabled={active}
                            className={`w-full py-2 px-3 rounded-lg text-sm text-left transition-colors ${
                              active
                                ? 'bg-blue-50 text-blue-700 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Activar/Desactivar */}
                <button
                  onClick={() => onActivarDesactivar?.(anuncio.id, !isActive)}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {isActive ? 'Desactivar Anuncio' : 'Activar Anuncio'}
                </button>
              </div>
            ) : (
              // Acción para crear anuncio
              <button
                onClick={() => onGestionar?.(data.id)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Crear Anuncio
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}