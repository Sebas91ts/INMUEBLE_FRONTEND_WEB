// src/pages/anuncios/AnunciosAdmin.jsx
import React, { useState } from 'react'
import { useAnuncios } from '../../hooks/useAnuncios'
import AnuncioAdminCard from '../anuncios/components/AnuncioAdminCard'

const AnunciosAdmin = () => {
  const { 
    anuncios, 
    inmueblesSinAnuncio, 
    loading, 
    error,
    crear,
    cambiarPrioridad,
    cambiarEstado,
    desactivar,
    activar
  } = useAnuncios()

  const [tabActiva, setTabActiva] = useState('activos')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  if (loading) return (
    <div className="p-6 flex justify-center items-center min-h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-500">Cargando anuncios...</p>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 rounded-xl p-6">
        <div className="flex items-center">
          <div className="text-red-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-red-800 font-medium">Error al cargar anuncios</h3>
            <p className="text-red-700 text-sm mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Separar anuncios activos e inactivos
  const anunciosActivos = anuncios.filter(a => a.is_active)
  const anunciosInactivos = anuncios.filter(a => !a.is_active)

  // Filtrar anuncios según pestaña y filtros
  const anunciosFiltrados = (tabActiva === 'activos' ? anunciosActivos : anunciosInactivos).filter(anuncio => {
    if (filtroBusqueda && !anuncio.inmueble_info.titulo.toLowerCase().includes(filtroBusqueda.toLowerCase()) &&
        !anuncio.inmueble_info.ciudad.toLowerCase().includes(filtroBusqueda.toLowerCase())) {
      return false
    }
    
    if (filtroPrioridad !== 'todos' && anuncio.prioridad !== filtroPrioridad) return false
    
    if (filtroEstado !== 'todos' && anuncio.estado !== filtroEstado) return false
    
    return true
  })

  const handleCrearAnuncio = async (inmuebleId) => {
    try {
      await crear(inmuebleId, { 
        estado: 'disponible', 
        prioridad: 'normal',
        is_active: true 
      })
    } catch (err) {
      console.error('Error al crear anuncio:', err)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Gestión de Anuncios</h1>
        <p className="text-gray-500 text-lg">Administra y configura los anuncios de propiedades</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl p-1 shadow-sm">
          <nav className="flex space-x-1">
            {[
              { id: 'activos', nombre: `Activos (${anunciosActivos.length})` },
              { id: 'inactivos', nombre: `Inactivos (${anunciosInactivos.length})` },
              { id: 'crear', nombre: `Crear (${inmueblesSinAnuncio.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                  tabActiva === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.nombre}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filtros (solo para pestañas de anuncios) */}
      {(tabActiva === 'activos' || tabActiva === 'inactivos') && (
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Título o ciudad..."
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="todos">Todas las prioridades</option>
                <option value="normal">Normal</option>
                <option value="destacado">Destacado</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="todos">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="vendido">Vendido</option>
                <option value="alquilado">Alquilado</option>
                <option value="reservado">Reservado</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltroBusqueda('')
                  setFiltroPrioridad('todos')
                  setFiltroEstado('todos')
                }}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido de las pestañas */}
      <div>
        {/* Pestaña: Anuncios Activos */}
        {tabActiva === 'activos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Anuncios Activos
                </h2>
                {anunciosFiltrados.length > 0 && (
                  <p className="text-gray-500 mt-1">{anunciosFiltrados.length} anuncios</p>
                )}
              </div>
            </div>
            
            {anunciosFiltrados.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay anuncios activos</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {anunciosActivos.length === 0 
                    ? "No hay anuncios activos en este momento." 
                    : "No hay anuncios que coincidan con los filtros aplicados."}
                </p>
                {anunciosActivos.length === 0 && (
                  <button
                    onClick={() => setTabActiva('crear')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Crear Primer Anuncio
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {anunciosFiltrados.map(anuncio => (
                  <AnuncioAdminCard 
                    key={anuncio.id}
                    data={anuncio.inmueble_info}
                    anuncio={anuncio}
                    onPrioridad={cambiarPrioridad}
                    onEstado={cambiarEstado}
                    onActivarDesactivar={(id, activar) => activar ? activar(id) : desactivar(id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pestaña: Anuncios Inactivos */}
        {tabActiva === 'inactivos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Anuncios Inactivos
                </h2>
                {anunciosFiltrados.length > 0 && (
                  <p className="text-gray-500 mt-1">{anunciosFiltrados.length} anuncios</p>
                )}
              </div>
            </div>
            
            {anunciosFiltrados.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay anuncios inactivos</h3>
                <p className="text-gray-500">Todos los anuncios están activos en este momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {anunciosFiltrados.map(anuncio => (
                  <AnuncioAdminCard 
                    key={anuncio.id}
                    data={anuncio.inmueble_info}
                    anuncio={anuncio}
                    onPrioridad={cambiarPrioridad}
                    onEstado={cambiarEstado}
                    onActivarDesactivar={(id, shouldActivate) => shouldActivate ? activar(id) : desactivar(id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pestaña: Crear Anuncios */}
        {tabActiva === 'crear' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Crear Nuevos Anuncios
                </h2>
                <p className="text-gray-500 mt-1">{inmueblesSinAnuncio.length} inmuebles disponibles</p>
              </div>
            </div>
            
            {inmueblesSinAnuncio.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Todos los inmuebles tienen anuncio</h3>
                <p className="text-gray-500">No hay inmuebles disponibles para crear nuevos anuncios.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {inmueblesSinAnuncio.map(inmueble => (
                  <AnuncioAdminCard 
                    key={inmueble.id}
                    data={inmueble}
                    onGestionar={handleCrearAnuncio}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnunciosAdmin