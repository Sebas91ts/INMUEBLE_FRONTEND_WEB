import { useState, useEffect } from 'react'
import { X, Home } from 'lucide-react'
import { useApi } from '../../../hooks/useApi'
import { postCopropietario } from '../../../api/usuarios/usuarios'
import { getUnidadesInactivas } from '../../../api/Unidades y Pertenencias/unidades_y_pertenencias'
const AñadirCopropietarioModal = ({ setShowModal, onSuccess }) => {
  const { error, loading, execute } = useApi(postCopropietario)
  const { data, execute: execute2 } = useApi(getUnidadesInactivas)

  useEffect(() => {
    execute2()
  }, [])

  const unidadesInactivas = data?.data?.values
  console.log(unidadesInactivas)

  const [formData, setFormData] = useState({
    username: '',
    nombre: '',
    ci: '',
    email: '',
    telefono: '',
    password: '',
    unidad: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await execute(formData) // llama al backend
      onSuccess?.() // recargar lista de usuarios si existe callback
      setShowModal(false) // cierra modal
    } catch (err) {
      console.error('Error creando copropietario:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className='fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center'>
            <Home className='text-blue-500 w-6 h-6 mr-2' />
            <h2 className='text-lg font-semibold text-gray-800'>
              Agregar Copropietario
            </h2>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className='text-gray-400 hover:text-gray-600'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Usuario *
            </label>
            <input
              type='text'
              name='username'
              value={formData.username}
              onChange={handleChange}
              required
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Nombre Completo *
            </label>
            <input
              type='text'
              name='nombre'
              value={formData.nombre}
              onChange={handleChange}
              required
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              CI *
            </label>
            <input
              type='text'
              name='ci'
              value={formData.ci}
              onChange={handleChange}
              required
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email *
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Teléfono
            </label>
            <input
              type='tel'
              name='telefono'
              value={formData.telefono}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Contraseña *
            </label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Unidad *
            </label>
            <select
              name='unidad'
              value={formData.unidad}
              onChange={handleChange}
              required
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Seleccione una unidad</option>
              {unidadesInactivas?.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.codigo} - Bloque {unidad.bloque}, Piso {unidad.piso},
                  Número {unidad.numero}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className='text-sm text-red-500'>
              {error.message || 'Error al crear copropietario'}
            </p>
          )}

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={() => setShowModal(false)}
              className='px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50'
            >
              {loading ? 'Creando...' : 'Crear Copropietario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AñadirCopropietarioModal
