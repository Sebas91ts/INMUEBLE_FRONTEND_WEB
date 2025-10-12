// src/api/inmueble/anuncios.js
import instancia from "../axios";


// ✅ Actualizar por anuncio_id (estado/is_active)
export const actualizarAnuncio = async (anuncioId, patch = {}) => {
  const { data } = await instancia.patch(`inmueble/anuncio/${anuncioId}/actualizar/`, patch);
  return data; // {status, error, message, values:{ ... }}
};

// Azúcares (PATCH)
export const setEstadoPorAnuncio = (anuncioId, estado) =>
  updateAnuncioById(anuncioId, { estado });

export const activarAnuncio = (anuncioId) =>
  updateAnuncioById(anuncioId, { is_active: true });

export const desactivarAnuncio = (anuncioId) =>
  updateAnuncioById(anuncioId, { is_active: false });

// ✅ Fallback cuando NO hay anuncio.id (usa POST anuncio/crear/)
export const crearAnuncio = async (inmuebleId, estado = "disponible", is_active = true) => {
  const payload = { inmueble: inmuebleId, estado, is_active };
  const { data } = await instancia.post("inmueble/anuncio/crear/", payload);
  return data; // {status, error, message, values:{ id, inmueble, estado, is_active }}
};
/** GET /inmueble/anuncio/:anuncio_id/estado/ */
export const getEstadoAnuncioById = async (anuncioId) => {
  const { data } = await instancia.get(`inmueble/anuncio/${anuncioId}/estado/`);
  return data; // { status, error, message, values: { inmueble, anuncio: { id, estado, is_active }, ... } }
};