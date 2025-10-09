import { useState } from 'react'
import { Pencil, RefreshCw } from 'lucide-react'
import { useComponentes } from '../../hooks/useComponentes'

export default function Componentes() {
  const { componentes, loading, error, editar, fetchComponentes } = useComponentes()
  const [editandoId, setEditandoId] = useState(null)

  const handleEditar = async (componente) => {
    const nombre = prompt('Nuevo nombre del componente:', componente.nombre)
    if (nombre !== null && nombre.trim() !== '') {
      await editar(componente.id, { nombre })
    }
  }

  if (loading) return <div className="p-6 text-gray-600">Cargando componentes...</div>
  if (error) return <div className="p-6 text-red-600">Error al cargar componentes</div>

  // Aseguramos que siempre sea un array
  const componentesArray = componentes?.componentes || []

  return (
    <div className="p-6 space-y-6">
      {/* Título y botón actualizar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Componentes</h1>
        <button
          onClick={fetchComponentes} // ahora refresca correctamente
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
        >
          <RefreshCw className="w-5 h-5" /> Actualizar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-300">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-600 uppercase">
              <th className="p-3 border-b border-gray-300">#</th>
              <th className="p-3 border-b border-gray-300">Nombre</th>
              <th className="p-3 border-b border-gray-300 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {componentesArray.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-6 text-gray-500">
                  No hay componentes registrados.
                </td>
              </tr>
            ) : (
              componentesArray.map((componente, index) => (
                <tr
                  key={componente.id || index}
                  className="text-gray-800 hover:bg-gray-100 transition border-b border-gray-200"
                >
                  <td className="p-3 text-sm">{index + 1}</td>
                  <td className="p-3 font-medium">{componente.nombre}</td>
                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() => handleEditar(componente)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
