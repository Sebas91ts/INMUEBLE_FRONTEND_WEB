import React, { useEffect, useState } from 'react'
import {
  getSolicitudes,
  cambiarEstadoSolicitud
} from '../../api/usuarios/usuarios'
import ApprovalModal from '../../components/AprovalModal'
import ErrorModal from '../../components/ErrorModal'
import { useApi } from '../../hooks/useApi'

const SolicitudesAgentes = () => {
  const {
    loading: loadingSolicitudes,
    error: errorSolicitudes,
    execute: fetchSolicitudes
  } = useApi(getSolicitudes)

  const { loading: loadingCambio, execute: ejecutarCambioEstado } = useApi(
    cambiarEstadoSolicitud
  )

  const [solicitudes, setSolicitudes] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')

  const [approvalModal, setApprovalModal] = useState({
    open: false,
    message: ''
  })
  const [errorModal, setErrorModal] = useState({ open: false, message: '' })

  // 🔹 Cargar solicitudes al montar
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchSolicitudes()
        if (res?.data?.values) {
          setSolicitudes(res.data.values)
        }
      } catch (err) {
        setErrorModal({
          open: true,
          message: 'Error al cargar las solicitudes.'
        })
      }
    }
    load()
  }, [fetchSolicitudes])
  console.log(solicitudes)

  // 🔹 Cambiar estado usando modales
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await ejecutarCambioEstado(id, nuevoEstado)
      if (res?.data?.status === 1) {
        // Actualizar la lista localmente
        setSolicitudes((prev) =>
          prev.map((s) =>
            s.idSolicitud === id ? { ...s, estado: nuevoEstado } : s
          )
        )
        setApprovalModal({
          open: true,
          message: `Solicitud ${nuevoEstado} correctamente.`
        })
      } else {
        setErrorModal({
          open: true,
          message: res?.data?.message || 'Error al cambiar estado.'
        })
      }
    } catch (err) {
      setErrorModal({
        open: true,
        message: 'Error al cambiar estado: ' + err.message
      })
    }
  }

  // 🔹 Filtro de estado + búsqueda
  const solicitudesFiltradas = solicitudes.filter((s) => {
    const coincideEstado = filtro === 'todas' || s.estado === filtro
    const coincideBusqueda =
      s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.correo.toLowerCase().includes(busqueda.toLowerCase())
    return coincideEstado && coincideBusqueda
  })

  // 🔹 Render
  if (loadingSolicitudes)
    return <p className='text-center text-gray-600'>Cargando solicitudes...</p>
  if (errorSolicitudes)
    return (
      <p className='text-red-500 text-center'>Error al cargar solicitudes</p>
    )

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold mb-6 text-gray-800'>
        Solicitudes de Agentes
      </h1>

      {/* 🔹 Filtros y búsqueda */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
        <div className='flex flex-wrap gap-3'>
          {['todas', 'pendiente', 'aceptado', 'rechazado'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                filtro === estado
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {estado === 'todas'
                ? 'Todas'
                : estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>

        <input
          type='text'
          placeholder='Buscar por nombre o correo...'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className='border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {/* 🔹 Lista de solicitudes */}
      {solicitudesFiltradas.length === 0 ? (
        <p className='text-gray-500 text-center mt-10'>
          No hay solicitudes que coincidan con los filtros.
        </p>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {solicitudesFiltradas.map((s) => (
            <div
              key={s.idSolicitud}
              className='bg-white rounded-2xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all duration-200'
            >
              <div className='flex justify-between items-center mb-3'>
                <h2 className='text-lg font-semibold text-gray-800'>
                  {s.nombre}
                </h2>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    s.estado === 'aceptado'
                      ? 'bg-green-100 text-green-700'
                      : s.estado === 'rechazado'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {s.estado}
                </span>
              </div>

              <p className='text-sm text-gray-600'>
                <strong>Correo:</strong> {s.correo}
              </p>
              <p className='text-sm text-gray-600'>
                <strong>Teléfono:</strong> {s.telefono || '—'}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                <strong>Fecha solicitud:</strong>{' '}
                {new Date(s.fecha_solicitud).toLocaleString()}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                <strong>Años de Experiencia:</strong> {s.experiencia}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                <strong>Numero de licencia :</strong> {s.numero_licencia || '—'}
              </p>

              <div className='flex gap-3 mt-4'>
                <button
                  onClick={() => handleCambiarEstado(s.idSolicitud, 'aceptado')}
                  disabled={s.estado === 'aceptado' || loadingCambio}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                    s.estado === 'aceptado'
                      ? 'bg-green-800 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Aceptar
                </button>
                <button
                  onClick={() =>
                    handleCambiarEstado(s.idSolicitud, 'rechazado')
                  }
                  disabled={
                    s.estado === 'rechazado' ||
                    s.estado === 'aceptado' ||
                    loadingCambio
                  } // ❌ Aquí deshabilitamos si ya está aceptada
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                    s.estado === 'rechazado' || s.estado === 'aceptado'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 Modales */}
      <ApprovalModal
        isOpen={approvalModal.open}
        onClose={() => setApprovalModal({ open: false, message: '' })}
        message={approvalModal.message}
      />
      <ErrorModal
        isOpen={errorModal.open}
        onClose={() => setErrorModal({ open: false, message: '' })}
        message={errorModal.message}
      />
    </div>
  )
}

export default SolicitudesAgentes
