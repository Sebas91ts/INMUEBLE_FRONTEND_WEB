import { useEffect } from 'react'
import { User } from 'lucide-react'
import { getBitacora } from '../../api/usuarios/usuarios'
import { useApi } from '../../hooks/useApi'

export default function BitacoraDashboard() {
  const {
    data: bitacoraData,
    loading,
    error,
    execute: fetchBitacora
  } = useApi(getBitacora)

  useEffect(() => {
    fetchBitacora()
  }, [fetchBitacora])

  const bitacoraList = bitacoraData?.data?.values || []

  return (
    <div className='p-3 space-y-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Bitácora de Actividad
        </h2>
        <button
          onClick={fetchBitacora}
          className='text-blue-600 hover:text-blue-800 text-sm font-medium'
        >
          Recargar
        </button>
      </div>

      {loading ? (
        <p>Cargando bitácora...</p>
      ) : error ? (
        <p className='text-red-500'>Error al cargar la bitácora</p>
      ) : bitacoraList.length === 0 ? (
        <p className='text-gray-400 italic'>No hay actividad registrada</p>
      ) : (
        <div className='max-h-[500px] overflow-y-auto bg-white rounded-2xl p-4 shadow-sm border border-gray-100'>
          {bitacoraList.map((item) => (
            <div
              key={item.id}
              className='flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors'
            >
              <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                <User className='w-5 h-5 text-gray-600' />
              </div>
              <div className='flex-1'>
                <p className='text-gray-900 font-medium'>{item.accion}</p>
                <p className='text-gray-500 text-sm mt-1'>
                  {new Date(item.fecha_hora).toLocaleString()} - IP:{' '}
                  {item.ip || 'Desconocida'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
