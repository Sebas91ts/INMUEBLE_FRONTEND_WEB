import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  X,
  Loader2,
  Pencil,
  Trash2,
  Check
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import {
  getUsuarios,
  eliminarUsuario,
  activarUsuario
} from '../../api/usuarios/usuarios'
import EditarUsuarioModal from './components/EditarUsuarioModal'
import ApprovalModal from '../../components/AprovalModal'

function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/40 z-50'>
      <div className='bg-white p-6 rounded-xl shadow-lg w-full max-w-sm'>
        <h3 className='text-lg font-bold mb-4'>Confirmación</h3>
        <p className='mb-6'>{message}</p>
        <div className='flex justify-end gap-3'>
          <button onClick={onClose} className='px-4 py-2 border rounded-lg'>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg'
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsuariosDashboard() {
  const [filterRole, setFilterRole] = useState('all')
  const [showModalEditar, setShowModalEditar] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showModalAprobar, setShowModalAprobar] = useState(false)
  const [verEliminados, setVerEliminados] = useState(false)

  const { data, error, loading, execute } = useApi(getUsuarios)
  const { execute: executeEliminar } = useApi(eliminarUsuario)
  const { execute: executeActivar } = useApi(activarUsuario)

  useEffect(() => {
    execute()
  }, [])

  const usuarios = data?.data?.values?.usuarios || []

  const filteredUsuarios = usuarios
    .filter((u) => (verEliminados ? !u.is_active : u.is_active))
    .filter(
      (u) =>
        filterRole === 'all' ||
        (u.grupo_nombre?.toLowerCase() || '') === filterRole
    )

  const handleSuccess = () => {
    setShowModalEditar(false)
    execute()
    setShowModalAprobar(true)
  }

  const handleEliminar = async () => {
    if (!usuarioSeleccionado) return
    await executeEliminar(usuarioSeleccionado.id)
    setShowConfirmModal(false)
    execute()
    setShowModalAprobar(true)
  }

  const handleActivar = async (usuario) => {
    await executeActivar(usuario.id)
    execute()
    setShowModalAprobar(true)
  }

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
          Gestión de Usuarios
        </h1>
        <button
          className='px-4 py-2 border rounded-lg'
          onClick={() => setVerEliminados(!verEliminados)}
        >
          {verEliminados ? 'Ver Activos' : 'Ver Eliminados'}
        </button>
      </div>

      {/* Filtro por rol */}
      <div className='flex items-center space-x-3'>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className='px-4 py-2 border border-gray-200 rounded-lg'
        >
          <option value='all'>Todos los roles</option>
          <option value='administrador'>Administrador</option>
          <option value='agente'>Agente</option>
          <option value='cliente'>Cliente</option>
        </select>
      </div>

      {/* Tabla de usuarios */}
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border border-gray-200 rounded-xl'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='px-4 py-2 text-left'>ID</th>
              <th className='px-4 py-2 text-left'>Usuario</th>
              <th className='px-4 py-2 text-left'>Nombre</th>
              <th className='px-4 py-2 text-left'>CI</th>
              <th className='px-4 py-2 text-left'>Teléfono</th>
              <th className='px-4 py-2 text-left'>Email</th>
              <th className='px-4 py-2 text-left'>Rol</th>
              <th className='px-4 py-2 text-left'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map((u) => (
              <tr key={u.id} className='border-t border-gray-100'>
                <td className='px-4 py-2'>{u.id}</td>
                <td className='px-4 py-2'>{u.username}</td>
                <td className='px-4 py-2'>{u.nombre || ''}</td>
                <td className='px-4 py-2'>{u.ci}</td>
                <td className='px-4 py-2'>{u.telefono || ''}</td>
                <td className='px-4 py-2'>{u.correo}</td>
                <td className='px-4 py-2'>{u.grupo_nombre}</td>
                <td className='px-4 py-2 flex gap-2'>
                  {u.is_active ? (
                    <>
                      <button
                        className='text-indigo-600 hover:text-indigo-800 flex items-center space-x-1'
                        onClick={() => {
                          setUsuarioSeleccionado(u)
                          setShowModalEditar(true)
                        }}
                      >
                        <Pencil className='w-4 h-4' />
                        <span>Editar</span>
                      </button>
                      <button
                        className='text-red-600 hover:text-red-800 flex items-center space-x-1'
                        onClick={() => {
                          setUsuarioSeleccionado(u)
                          setShowConfirmModal(true)
                        }}
                      >
                        <Trash2 className='w-4 h-4' />
                        <span>Eliminar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      className='text-green-600 hover:text-green-800 flex items-center space-x-1'
                      onClick={() => handleActivar(u)}
                    >
                      <Check className='w-4 h-4' />
                      <span>Activar</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {showModalEditar && usuarioSeleccionado && (
        <EditarUsuarioModal
          usuario={usuarioSeleccionado}
          setShowModal={setShowModalEditar}
          onSuccess={handleSuccess}
        />
      )}

      {showConfirmModal && usuarioSeleccionado && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleEliminar}
          message={`¿Está seguro de eliminar al usuario "${usuarioSeleccionado.username}"?`}
        />
      )}

      {showModalAprobar && (
        <ApprovalModal
          isOpen={showModalAprobar}
          onClose={() => setShowModalAprobar(false)}
          message='Operación realizada exitosamente'
        />
      )}
    </div>
  )
}
