// src/hooks/useAnuncios.js
import { useState, useEffect } from 'react'
import { 
  listarAnuncios, 
  listarInmueblesSinAnuncio, 
  crearAnuncio,
  adminSetEstado,
  adminActivarAnuncio,
  adminDesactivarAnuncio,
  adminCambiarPrioridad
} from '../api/inmueble/anuncios'

export const useAnuncios = () => {
  const [anuncios, setAnuncios] = useState([])
  const [inmueblesSinAnuncio, setInmueblesSinAnuncio] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnuncios = async (showAll = true) => {
    try {
      setLoading(true)
      const { data } = await listarAnuncios(showAll)
      setAnuncios(data.values?.anuncios || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchInmueblesSinAnuncio = async () => {
    try {
      const { data } = await listarInmueblesSinAnuncio()
      setInmueblesSinAnuncio(data.values?.inmuebles || [])
    } catch (err) {
      setError(err)
    }
  }

  const crear = async (inmueble_id, anuncioData) => {
    await crearAnuncio(inmueble_id, anuncioData)
    await fetchAnuncios(true)
    await fetchInmueblesSinAnuncio()
  }

  // Usando las nuevas funciones del admin
  const cambiarPrioridad = async (id, prioridad) => {
    await adminCambiarPrioridad(id, prioridad)
    await fetchAnuncios(true)
  }

  const cambiarEstado = async (id, estado) => {
    await adminSetEstado(id, estado)
    await fetchAnuncios(true)
  }

  const desactivar = async (id) => {
    await adminDesactivarAnuncio(id)
    await fetchAnuncios(true)
  }

  const activar = async (id) => {
    await adminActivarAnuncio(id)
    await fetchAnuncios(true)
  }

  useEffect(() => {
    fetchAnuncios(true)
    fetchInmueblesSinAnuncio()
  }, [])

  return { 
    anuncios, 
    inmueblesSinAnuncio,
    loading, 
    error, 
    crear, 
    cambiarPrioridad,
    cambiarEstado,
    desactivar,
    activar,
    refetchAnuncios: () => fetchAnuncios(true)
  }
}