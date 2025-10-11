import api from "../axios";

function ensureAllowed(res) {
  const d = res?.data;
  // Backend "niega" con 200 y payload {status:2, error:1, message:'...'}
  if (d && (d.status === 2 || d.error === 1)) {
    const err = new Error(d.message || "Acción no permitida");
    err.response = res;
    throw err;
  }
  return res;
}

export const listarCitas   = () => api.get("/cita/").then(ensureAllowed);
export const obtenerCita   = (id) => api.get(`/cita/${id}/`).then(ensureAllowed);
export const crearCita     = (payload) => api.post("/cita/crear/", payload).then(ensureAllowed);

// Reprogramar (tu backend acepta POST)
export const reprogramarCita = (id, payload) =>
  api.post(`/cita/${id}/reprogramar/`, payload).then(ensureAllowed);

// Eliminar (si tu backend acepta DELETE, dejamos DELETE; si usa POST, cambia aquí)
export const eliminarCita = (id) =>
  api.delete(`/cita/${id}/eliminar/`).then(ensureAllowed);
   