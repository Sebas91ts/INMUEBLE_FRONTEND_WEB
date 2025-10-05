import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { updateResidente } from '../../../api/usuarios/usuarios'

export default function EditarResidenteModal({
  residente,
  setShowModal,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    nombre: residente.nombre || '',
    ci: residente.ci || '',
    telefono: residente.telefono || '',
    correo: residente.correo || '',
    estado: residente.estado || 'activo',
    id_unidad: residente.id_unidad || '',
    foto: null
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData({ ...formData, [name]: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      let dataToSend
      // Si hay foto, enviamos FormData
      if (formData.foto) {
        dataToSend = new FormData()
        for (const key in formData) {
          if (formData[key] !== null) {
            dataToSend.append(key, formData[key])
          }
        }
      } else {
        dataToSend = { ...formData } // JSON normal
      }

      await updateResidente(residente.id_residente, dataToSend)
      onSuccess() // refresca la lista de residentes
      setShowModal(false) // cierra el modal
    } catch (err) {
      console.log('Error al actualizar residente:', err.response?.data)
      setErrors(err.response?.data || {})
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl w-full max-w-md p-6 relative'>
        <button
          className='absolute top-4 right-4 text-gray-500 hover:text-gray-700'
          onClick={() => setShowModal(false)}
        >
          <X className='w-5 h-5' />
        </button>
        <h2 className='text-xl font-bold mb-4'>Editar Residente</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium'>Nombre</label>
            <input
              type='text'
              name='nombre'
              value={formData.nombre}
              onChange={handleChange}
              className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
            />
            {errors.nombre && (
              <p className='text-red-500 text-sm'>{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium'>CI</label>
            <input
              type='text'
              name='ci'
              value={formData.ci}
              onChange={handleChange}
              className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
            />
            {errors.ci && <p className='text-red-500 text-sm'>{errors.ci}</p>}
          </div>

          <div>
            <label className='block text-sm font-medium'>Teléfono</label>
            <input
              type='text'
              name='telefono'
              value={formData.telefono}
              onChange={handleChange}
              className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
            />
            {errors.telefono && (
              <p className='text-red-500 text-sm'>{errors.telefono}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium'>Correo</label>
            <input
              type='email'
              name='correo'
              value={formData.correo}
              onChange={handleChange}
              className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
            />
            {errors.correo && (
              <p className='text-red-500 text-sm'>{errors.correo}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium'>Estado</label>
            <select
              name='estado'
              value={formData.estado}
              onChange={handleChange}
              className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
            >
              <option value='activo'>Activo</option>
              <option value='inactivo'>Inactivo</option>
            </select>
            {errors.estado && (
              <p className='text-red-500 text-sm'>{errors.estado}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium'>Unidad</label>
            <input
              type='number'
              name='id_unidad'
              value={formData.id_unidad}
              onChange={handleChange}
              className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
            />
            {errors.id_unidad && (
              <p className='text-red-500 text-sm'>{errors.id_unidad}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium'>Foto</label>
            <input
              type='file'
              name='foto'
              accept='image/*'
              onChange={handleChange}
              className='mt-1 block w-full'
            />
            {errors.foto && (
              <p className='text-red-500 text-sm'>{errors.foto}</p>
            )}
          </div>

          <div className='flex justify-end'>
            <button
              type='submit'
              className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2'
              disabled={loading}
            >
              {loading && <Loader2 className='w-4 h-4 animate-spin' />}
              <span>Guardar cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
