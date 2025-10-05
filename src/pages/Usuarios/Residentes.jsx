import { useState, useEffect } from 'react'
import { Users, UserPlus, X, Loader2, Pencil } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getResidentes } from '../../api/usuarios/usuarios'
import EditarResidenteModal from './components/EditarResidenteModal'

export default function ResidentesDashboard() {
  const [showModalEditar, setShowModalEditar] = useState(false)
  const [residenteSeleccionado, setResidenteSeleccionado] = useState(null)
  const [showFoto, setShowFoto] = useState(false)
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null)

  const { data, error, loading, execute } = useApi(getResidentes)

  useEffect(() => {
    execute()
  }, [])
  console.log('data', data)
  const residentes = data?.data || []

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='animate-spin' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p className='text-red-500'>{error}</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Gestión de Residentes
        </h1>
      </div>

      {/* Tabla de residentes */}
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border border-gray-200 rounded-xl'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='px-4 py-2 text-left'>ID</th>
              <th className='px-4 py-2 text-left'>Nombre</th>
              <th className='px-4 py-2 text-left'>CI</th>
              <th className='px-4 py-2 text-left'>Teléfono</th>
              <th className='px-4 py-2 text-left'>Email</th>
              <th className='px-4 py-2 text-left'>Estado</th>
              <th className='px-4 py-2 text-left'>Unidad</th>
              <th className='px-4 py-2 text-left'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {residentes.map((r) => (
              <tr key={r.id_residente} className='border-t border-gray-100'>
                <td className='px-4 py-2'>{r.id_residente}</td>
                <td className='px-4 py-2'>{r.nombre}</td>
                <td className='px-4 py-2'>{r.ci}</td>
                <td className='px-4 py-2'>{r.telefono || ''}</td>
                <td className='px-4 py-2'>{r.correo}</td>
                <td className='px-4 py-2'>{r.estado}</td>
                <td className='px-4 py-2'>{r.id_unidad || ''}</td>
                <td className='px-4 py-2'>
                  <button
                    className='text-indigo-600 hover:text-indigo-800 flex items-center space-x-1'
                    onClick={() => {
                      setResidenteSeleccionado(r)
                      setShowModalEditar(true)
                    }}
                  >
                    <Pencil className='w-4 h-4' />
                    <span>Editar</span>
                  </button>
                  {r.foto && (
                    <button
                      className='text-blue-600 hover:text-blue-800'
                      onClick={() => {
                        setFotoSeleccionada(r.foto)
                        setShowFoto(true)
                      }}
                    >
                      Ver foto
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}

      {showModalEditar && residenteSeleccionado && (
        <EditarResidenteModal
          residente={residenteSeleccionado}
          setShowModal={setShowModalEditar}
          onSuccess={execute} // refresca la lista
        />
      )}
      {showFoto && fotoSeleccionada && (
        <div className='fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-4 rounded-lg shadow-lg relative max-w-md w-full'>
            <button
              className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
              onClick={() => setShowFoto(false)}
            >
              <X className='w-5 h-5' />
            </button>
            <img
              src={fotoSeleccionada}
              alt='Foto del residente'
              className='rounded-lg max-h-[70vh] object-contain mx-auto'
            />
          </div>
        </div>
      )}
    </div>
  )
}
