// src/pages/usuarios/components/EditarUsuarioModal.jsx
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useApi } from '../../../hooks/useApi'
import { updateUsuario } from '../../../api/usuarios/usuarios'

export default function EditarUsuarioModal({
  usuario,
  setShowModal,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    username: usuario.username || '',
    nombre: usuario.nombre || '',
    ci: usuario.ci || '',
    telefono: usuario.telefono || '',
    email: usuario.email || '',
    passsword: usuario.password || '',
    rol_name: usuario.rol_name || 'copropietario'
  })

  const { loading, error, execute } = useApi(updateUsuario)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await execute(usuario.id, formData)
    if (result.success) {
      onSuccess()
      setShowModal(false)
    }
  }

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-50'>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-lg p-6'>
        {/* Header */}
        <div className='flex justify-between items-center border-b pb-3 mb-4'>
          <h2 className='text-xl font-bold text-gray-900'>Editar Usuario</h2>
          <button
            onClick={() => setShowModal(false)}
            className='text-gray-500 hover:text-gray-700'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium'>Usuario</label>
            <input
              type='text'
              name='username'
              value={formData.username}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium'>Nombre</label>
            <input
              type='text'
              name='nombre'
              value={formData.nombre}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>

          <div>
            <label className='block text-sm font-medium'>CI</label>
            <input
              type='text'
              name='ci'
              value={formData.ci}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>

          <div>
            <label className='block text-sm font-medium'>Teléfono</label>
            <input
              type='text'
              name='telefono'
              value={formData.telefono}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>

          <div>
            <label className='block text-sm font-medium'>Email</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>

          <div>
            <label className='block text-sm font-medium'>
              Cambiar Contraseña
            </label>
            <input
              type='password'
              name='password'
              value={formData.password}
              placeholder='Cambiar Contraseña'
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>

          <div>
            <label className='block text-sm font-medium'>Rol</label>
            <select
              name='rol_name'
              value={formData.rol_name}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            >
              <option value='administrador'>Administrador</option>
              <option value='copropietario'>Copropietario</option>
              <option value='personal'>Personal</option>
            </select>
          </div>

          {error && <p className='text-red-500 text-sm'>{error}</p>}

          {/* Botones */}
          <div className='flex justify-end gap-3 mt-4'>
            <button
              type='button'
              onClick={() => setShowModal(false)}
              className='px-4 py-2 rounded-lg border border-gray-300'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
            >
              {loading && <Loader2 className='w-4 h-4 animate-spin' />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
