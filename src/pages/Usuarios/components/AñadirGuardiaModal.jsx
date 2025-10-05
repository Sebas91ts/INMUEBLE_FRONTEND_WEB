import { X, Loader2 } from 'lucide-react'
import { postPersonal } from '../../../api/usuarios/usuarios'
import { useApi } from '../../../hooks/useApi'
import { useState } from 'react'

import ApprovalModal from '../../../components/AprovalModal'
import ErrorModal from '../../../components/ErrorModal'

export default function AñadirGuardiaModal({ setShowModal, onSuccess }) {
  const { execute, loading, error } = useApi(postPersonal)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  const [personalForm, setPersonalForm] = useState({
    username: '',
    ci: '',
    nombre: '',
    email: '',
    telefono: '',
    turno: '',
    tipo_personal: '',
    password: ''
  })

  const handleGuardiaSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await execute(personalForm)
      console.log('Empleado registrado:', response.data)

      setShowModal(false)
      onSuccess?.()
      setApprovalModalOpen(true)
    } catch (err) {
      console.error('Error al registrar guardia:', err)
      setErrorModalOpen(true)
    }
  }

  return (
    <>
      <div className='fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
          <div className='p-6 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>
                Añadir Guardia
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
            <p className='text-sm text-gray-600 mt-1'>
              Completa los datos para registrar un nuevo guardia en el sistema.
            </p>
          </div>

          <form onSubmit={handleGuardiaSubmit} className='p-6 space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Usuario
                </label>
                <input
                  type='text'
                  value={personalForm.username}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({
                      ...prev,
                      username: e.target.value
                    }))
                  }
                  placeholder='personal...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  CI
                </label>
                <input
                  type='text'
                  value={personalForm.ci}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({ ...prev, ci: e.target.value }))
                  }
                  placeholder='87654321'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nombre Completo
              </label>
              <input
                type='text'
                value={personalForm.nombre}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    nombre: e.target.value
                  }))
                }
                placeholder='Pedro López'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <input
                type='email'
                value={personalForm.email}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    email: e.target.value
                  }))
                }
                placeholder='pedro@example.com'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Teléfono
              </label>
              <input
                type='text'
                value={personalForm.telefono}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    telefono: e.target.value
                  }))
                }
                placeholder='98765432'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Turno
                </label>
                <select
                  value={personalForm.turno}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({
                      ...prev,
                      turno: e.target.value
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                >
                  <option value=''>Seleccionar turno</option>
                  <option value='mañana'>Mañana</option>
                  <option value='tarde'>Tarde</option>
                  <option value='noche'>Noche</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tipo de Personal
                </label>
                <select
                  value={personalForm.tipo_personal}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({
                      ...prev,
                      tipo_personal: e.target.value
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                >
                  <option value=''>Seleccionar Personal</option>
                  <option value='guardia'>Guardia</option>
                  <option value='limpieza'>Limpieza</option>
                  <option value='mantenimiento'>Mantenimiento</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Contraseña
              </label>
              <input
                type='password'
                value={personalForm.password}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    password: e.target.value
                  }))
                }
                placeholder='PasswordSeguro123'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>

            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={() => setShowModal(false)}
                className='flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {loading && <Loader2 className='h-4 w-4 animate-spin' />}
                Registrar Guardia
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modales de éxito y error */}
      {approvalModalOpen && (
        <ApprovalModal
          message='Guardia registrado correctamente'
          onClose={() => setApprovalModalOpen(false)}
        />
      )}
      {errorModalOpen && (
        <ErrorModal
          message={`Error al registrar guardia. ${error?.message || ''}`}
          onClose={() => setErrorModalOpen(false)}
        />
      )}
    </>
  )
}
