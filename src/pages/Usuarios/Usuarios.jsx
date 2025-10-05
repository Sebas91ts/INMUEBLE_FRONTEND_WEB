import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  UserRoundPlus,
  X,
  Loader2,
  Pencil
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getUsuarios } from '../../api/usuarios/usuarios'
import AñadirCopropietarioModal from './components/AñadirCopropietarioModal'
import AñadirGuardiaModal from './components/AñadirGuardiaModal'
import EditarUsuarioModal from './components/EditarUsuarioModal'

export default function UsuariosDashboard() {
  const [filterRole, setFilterRole] = useState('all')
  const [showModalCopropietario, setShowModalCopropietario] = useState(false)
  const [showModalGuardia, setShowModalGuardia] = useState(false)
  const [showModalEditar, setShowModalEditar] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)

  const { data, error, loading, execute } = useApi(getUsuarios)

  useEffect(() => {
    execute()
  }, [])

  const usuarios = data?.data?.values || []
  console.log(usuarios)
  const filteredUsuarios =
    filterRole === 'all'
      ? usuarios
      : usuarios.filter((u) => u.rol_name.toLowerCase() === filterRole)

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
        <div className='flex gap-2'>
          <button
            className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2'
            onClick={() => setShowModalCopropietario(true)}
          >
            <UserPlus className='w-4 h-4' />
            <span>Nuevo Copropietario</span>
          </button>
          <button
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2'
            onClick={() => setShowModalGuardia(true)}
          >
            <UserRoundPlus className='w-4 h-4' />
            <span>Nuevo Personal</span>
          </button>
        </div>
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
          <option value='copropietario'>Copropietario</option>
          <option value='guardia'>Guardia</option>
          <option value='residente'>Residente</option>
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
                <td className='px-4 py-2'>{u.email}</td>
                <td className='px-4 py-2'>{u.rol_name}</td>
                <td className='px-4 py-2'>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {showModalCopropietario && (
        <AñadirCopropietarioModal
          setShowModal={setShowModalCopropietario}
          onSuccess={execute}
        />
      )}
      {showModalGuardia && (
        <AñadirGuardiaModal
          setShowModal={setShowModalGuardia}
          onSuccess={execute}
        />
      )}
      {showModalEditar && usuarioSeleccionado && (
        <EditarUsuarioModal
          usuario={usuarioSeleccionado}
          setShowModal={setShowModalEditar}
          onSuccess={execute}
        />
      )}
    </div>
  )
}
