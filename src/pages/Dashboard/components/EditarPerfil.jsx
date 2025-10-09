// src/pages/perfil/EditarPerfil.jsx
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useApi } from '../../../hooks/useApi'
import { updateUsuario } from '../../../api/usuarios/usuarios'
import { useAuth } from '../../../hooks/useAuth'
import ApprovalModal from '../../../components/AprovalModal'
import ErrorModal from '../../../components/ErrorModal'

export default function EditarPerfil() {
  const { user, updateUser } = useAuth() // Usuario logueado
  const { loading, error: apiError, execute } = useApi(updateUsuario)

  const [formData, setFormData] = useState({
    username: user.username || '',
    nombre: user.nombre || '',
    ci: user.ci || '',
    telefono: user.telefono || '',
    correo: user.correo || '',
    ubicacion: user.ubicacion || '',
    password: ''
  })

  const [successModal, setSuccessModal] = useState(false)
  const [errorModal, setErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 🔹 Crear copia del formData
    const dataToSend = { ...formData }

    // 🔹 Si la contraseña está vacía, eliminarla
    if (!dataToSend.password || dataToSend.password.trim() === '') {
      delete dataToSend.password
    }
    console.log(dataToSend)

    const result = await execute(user.id, dataToSend)

    if (result?.data?.status === 1) {
      updateUser({ ...user, ...dataToSend })
      setSuccessModal(true)
    } else {
      setErrorMessage(result?.data?.message || 'Ocurrió un error')
      setErrorModal(true)
    }
  }

  if (!formData) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='animate-spin w-6 h-6' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-6 sm:px-10'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Editar Perfil</h1>
        <p className='text-gray-600 mt-2'>Actualiza tu información personal</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className='space-y-6 max-w-3xl'>
        {/* Usuario y Nombre */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Usuario
            </label>
            <input
              type='text'
              name='username'
              value={formData.username}
              onChange={handleChange}
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Nombre
            </label>
            <input
              type='text'
              name='nombre'
              value={formData.nombre}
              onChange={handleChange}
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>

        {/* CI y Teléfono */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              CI
            </label>
            <input
              type='text'
              name='ci'
              value={formData.ci}
              onChange={handleChange}
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Teléfono
            </label>
            <input
              type='text'
              name='telefono'
              value={formData.telefono}
              onChange={handleChange}
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>

        {/* Correo y Ubicación */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Correo
            </label>
            <input
              type='email'
              name='correo'
              value={formData.correo}
              onChange={handleChange}
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Ubicación
            </label>
            <input
              type='text'
              name='ubicacion'
              value={formData.ubicacion}
              onChange={handleChange}
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Cambiar Contraseña
          </label>
          <input
            type='password'
            name='password'
            value={formData.password}
            placeholder='Nueva contraseña'
            onChange={handleChange}
            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        {apiError && <p className='text-red-500 text-sm'>{apiError}</p>}

        {/* Botón */}
        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2'
          >
            {loading && <Loader2 className='w-4 h-4 animate-spin' />}
            Guardar cambios
          </button>
        </div>
      </form>

      {/* Modales */}
      <ApprovalModal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        message='Perfil actualizado correctamente.'
      />

      <ErrorModal
        isOpen={errorModal}
        onClose={() => setErrorModal(false)}
        message={errorMessage}
      />
    </div>
  )
}
