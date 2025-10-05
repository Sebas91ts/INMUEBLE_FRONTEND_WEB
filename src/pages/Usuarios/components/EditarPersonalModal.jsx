import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { updatePersonal } from '../../../api/usuarios/usuarios'
import { useApi } from '../../../hooks/useApi'

import ApprovalModal from '../../../components/AprovalModal'
import ErrorModal from '../../../components/ErrorModal'

export default function EditarPersonalModal({
  personal,
  setShowModal,
  onSuccess
}) {
  const { execute, loading, error } = useApi(updatePersonal)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [form, setForm] = useState({
    username: '',
    nombre: '',
    ci: '',
    telefono: '',
    email: '',
    turno: '',
    tipo_personal: ''
  })

  useEffect(() => {
    if (personal) {
      setForm({
        username: personal.username || '',
        nombre: personal.nombre || '',
        ci: personal.ci || '',
        telefono: personal.telefono || '',
        email: personal.email || '',
        turno: personal.turno || '',
        tipo_personal: personal.tipo_personal || ''
      })
    }
  }, [personal])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    try {
      await execute(personal.id, form)
      // Si execute lanza error, irá al catch automáticamente
      setApprovalModalOpen(true)
    } catch (err) {
      setErrorModalOpen(true)
    }
  }

  if (!personal) return null

  return (
    <>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20'>
        <div className='bg-white rounded-lg w-96 p-6 relative'>
          <button
            className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
            onClick={() => setShowModal(false)}
          >
            <X className='w-5 h-5' />
          </button>

          <h2 className='text-lg font-bold mb-4'>Editar Personal</h2>

          <div className='space-y-4'>
            {/** Campos del formulario **/}
            {['username', 'nombre', 'ci', 'telefono', 'email'].map((field) => (
              <div key={field}>
                <label className='block text-sm font-medium text-gray-700'>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg'
                />
              </div>
            ))}

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Turno
              </label>
              <select
                name='turno'
                value={form.turno}
                onChange={handleChange}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg'
              >
                <option value='mañana'>Mañana</option>
                <option value='tarde'>Tarde</option>
                <option value='noche'>Noche</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Tipo de Personal
              </label>
              <select
                name='tipo_personal'
                value={form.tipo_personal}
                onChange={handleChange}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg'
              >
                <option value='guardia'>Guardia</option>
                <option value='limpieza'>Limpieza</option>
                <option value='mantenimiento'>Mantenimiento</option>
              </select>
            </div>
          </div>

          <div className='mt-6 flex justify-end space-x-2'>
            <button
              className='px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300'
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>
            <button
              className='px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700'
              onClick={handleSave}
              disabled={loading}
            >
              {loading && <Loader2 className='w-4 h-4 animate-spin' />}
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </div>

      {/** Modales **/}
      <ApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false)
          setShowModal(false)
          onSuccess?.()
        }}
        message='Personal actualizado correctamente'
      />

      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={`Error al actualizar Personal. ${
          error?.message || error || ''
        }`}
      />
    </>
  )
}
