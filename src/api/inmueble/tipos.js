// src/api/inmueble/tipos.js
import axios from '../axios' // tu instancia con baseURL y token

export const listarTipos = () =>
  axios.get('/inmueble/listar_tipo_inmuebles')

export const crearTipo = (payload) =>
  axios.post('/inmueble/crear_tipo_inmueble', payload)
// payload: { nombre, descripcion }

export const actualizarTipo = (id, payload) =>
  axios.patch(`/inmueble/actualizar_tipo_inmueble/${id}`, payload)

export const eliminarTipo = (id) =>
  axios.delete(`/inmueble/eliminar_tipo_inmueble/${id}`) // desactiva

export const activarTipo = (id) =>
  axios.patch(`/inmueble/activar_tipo_inmueble/${id}`)
