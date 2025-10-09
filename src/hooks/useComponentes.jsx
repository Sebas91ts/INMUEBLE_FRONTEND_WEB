import { useState, useEffect } from 'react'
import { listarComponentes, crearComponente, editarComponente, eliminarComponente, activarComponente } from '../api/permisos/componentes'

export const useComponentes = () => {
  const [componentes, setComponentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComponentes = async () => {
    try {
      setLoading(true)
      const { data } = await listarComponentes()
      setComponentes(data.values || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const crear = async (nombre, descripcion) => {
    await crearComponente(nombre, descripcion)
    await fetchComponentes()
  }

  const editar = async (id, data) => {
    await editarComponente(id, data)
    await fetchComponentes()
  }

  const eliminar = async (id) => {
    await eliminarComponente(id)
    await fetchComponentes()
  }

  const activar = async (id) => {
    await activarComponente(id)
    await fetchComponentes()
  }

  useEffect(() => {
    fetchComponentes()
  }, [])

  return { componentes, loading, error, crear, editar, eliminar, activar }
}
