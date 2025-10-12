// src/api/inmueble/anuncios.js
import instancia from "../axios";

/**
 * Publica o reactiva un inmueble (crea/activa el anuncio con 'disponible').
 * Devuelve { data } para que el caller pueda usar resp?.data?.values ...
 */
export async function publicarInmueble(inmuebleId) {
  const candidates = [
    // tu ruta real según urls.py (SIN slash final)
    `inmueble/publicar_inmueble/${inmuebleId}`,
    // fallback si el server espera slash
    `inmueble/publicar_inmueble/${inmuebleId}/`,
  ];

  let lastErr;
  for (const url of candidates) {
    try {
      const { data } = await instancia.post(url);
      return { data };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/**
 * Actualiza un anuncio existente por ID.
 * patch: { estado?: 'disponible'|'vendido'|'alquilado'|'anticretico', is_active?: boolean }
 * Devuelve { data } para mantener consistencia con MisInmuebles.jsx
 */
export async function actualizarAnuncio(anuncioId, patch = {}) {
  const candidates = [
    `inmueble/anuncio/${anuncioId}/actualizar/`,
    `inmueble/anuncio/${anuncioId}/actualizar`,
  ];

  let lastErr;
  for (const url of candidates) {
    try {
      const { data } = await instancia.patch(url, patch);
      return { data };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

// Azúcares (PATCH) — todos usan actualizarAnuncio
export const setEstadoPorAnuncio = (anuncioId, estado) =>
  actualizarAnuncio(anuncioId, { estado });

export const activarAnuncio = (anuncioId) =>
  actualizarAnuncio(anuncioId, { is_active: true });

export const desactivarAnuncio = (anuncioId) =>
  actualizarAnuncio(anuncioId, { is_active: false });

/** GET /inmueble/anuncio/:anuncio_id/estado/ */
export async function getEstadoAnuncioById(anuncioId) {
  const { data } = await instancia.get(`inmueble/anuncio/${anuncioId}/estado/`);
  return data; // { status, error, message, values: { anuncio: { id, estado, is_active }, ... } }
}

// Alias útil si lo usas en otros lados (mismo endpoint que arriba)
export const getEstadoPorAnuncio = getEstadoAnuncioById;
