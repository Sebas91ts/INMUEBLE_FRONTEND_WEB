import { useState, useEffect } from 'react'
import { UserPlus, UserRoundPlus, X, Loader2, Edit } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getPersonal } from '../../api/usuarios/usuarios'
import AñadirCopropietarioModal from './components/AñadirCopropietarioModal'
import AñadirGuardiaModal from './components/AñadirGuardiaModal'
import EditarPersonalModal from './components/EditarPersonalModal'

export default function PersonalDashboard() {
  const [filterRole, setFilterRole] = useState('all')
  const [showModalCopropietario, setShowModalCopropietario] = useState(false)
  const [showModalPersonal, setShowModalPersonal] = useState(false)
  const [editarPersonal, setEditarPersonal] = useState(null)

  const { data, error, loading, execute } = useApi(getPersonal)

  useEffect(() => {
    execute()
  }, [])

  // Extraemos la lista de personal desde la respuesta de la API
  const personalList = data?.data?.values || []

  console.log(personalList)

  const filteredPersonal =
    filterRole === 'all'
      ? personalList
      : personalList.filter((p) => p.rol_name.toLowerCase() === filterRole)

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
          Gestión de Personal
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
            onClick={() => setShowModalPersonal(true)}
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
          <option value='personal'>Personal</option>
        </select>
      </div>

      {/* Tabla de personal */}
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
              <th className='px-4 py-2 text-left'>Tipo Personal</th>
              <th className='px-4 py-2 text-left'>Turno</th>
              <th className='px-4 py-2 text-left'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonal.map((p) => (
              <tr key={p.id} className='border-t border-gray-100'>
                <td className='px-4 py-2'>{p.id}</td>
                <td className='px-4 py-2'>{p.username}</td>
                <td className='px-4 py-2'>{p.nombre || ''}</td>
                <td className='px-4 py-2'>{p.ci}</td>
                <td className='px-4 py-2'>{p.telefono || ''}</td>
                <td className='px-4 py-2'>{p.email}</td>
                <td className='px-4 py-2'>{p.tipo_personal || ''}</td>
                <td className='px-4 py-2'>{p.turno || ''}</td>
                <td className='px-4 py-2'>
                  {p.rol_name.toLowerCase() === 'personal' && (
                    <button
                      className='flex items-center space-x-1 text-blue-600 hover:text-blue-800'
                      onClick={() => setEditarPersonal(p)}
                    >
                      <Edit className='w-4 h-4' />
                      <span>Editar</span>
                    </button>
                  )}
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
      {showModalPersonal && (
        <AñadirGuardiaModal
          setShowModal={setShowModalPersonal}
          onSuccess={execute}
        />
      )}
      {editarPersonal && (
        <EditarPersonalModal
          personal={editarPersonal}
          setShowModal={setEditarPersonal}
          onSuccess={execute}
        />
      )}
    </div>
  )
}
