// src/api/inmueble/anuncios.js
import instancia from "../axios";
// ========== FUNCIONES NUEVAS PARA EL ADMIN ==========
// Listar TODOS los anuncios (activos e inactivos)
export const listarAnuncios = (showAll = false) => {
  const params = showAll ? { show_all: true } : {};
  return instancia.get('inmueble/anuncios', { params });
}

export const listarInmueblesSinAnuncio = () => {
  return instancia.get('inmueble/anuncios/no_publicados');
}

export const crearAnuncio = (inmueble_id, data) => {
  return instancia.post(`inmueble/anuncios/crear/${inmueble_id}`, data);
}

export const editarAnuncio = (anuncio_id, data) => {
  return instancia.patch(`inmueble/anuncios/${anuncio_id}`, data);
}

// Funciones específicas para el admin usando las rutas correctas
export const adminSetEstado = (anuncioId, estado) =>
  editarAnuncio(anuncioId, { estado });

export const adminActivarAnuncio = (anuncioId) =>
  editarAnuncio(anuncioId, { is_active: true });

export const adminDesactivarAnuncio = (anuncioId) =>
  editarAnuncio(anuncioId, { is_active: false });

export const adminCambiarPrioridad = (anuncioId, prioridad) =>
  editarAnuncio(anuncioId, { prioridad });

export const getAnuncioById = async (id) => {
  try {
    // ✅ Sin slash final
    const response = await instancia.get(`inmueble/anuncios/detalle/${id}`);
    
    if (response.data.status === 1) {
      return response.data; // Devuelve toda la respuesta
    } else {
      throw new Error(response.data.message || 'Error al obtener el anuncio');
    }
  } catch (error) {
    console.error('Error en getAnuncioById:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener el anuncio');
  }
};
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