// src/api/inmueble/historial.js
import instancia from "../axios";

/* =========================================================
   🕓 HISTORIAL DE PUBLICACIONES (Agente)
========================================================= */

// 🔹 Obtener el historial de publicaciones del agente
export const getHistorialPublicaciones = async () => {
  const { data } = await instancia.get("inmueble/historial-publicaciones");
  return data;
};

// 🔹 Publicar inmueble aprobado
export const publicarInmuebleHistorial = async (id) => {
  const { data } = await instancia.post(`inmueble/publicar_inmueble/${id}`);
  return data;
};

// 🔹 Solicitar corrección (editar y reenviar)
export const solicitarCorreccionInmueble = async (id, payload) => {
  const { data } = await instancia.put(
    `inmueble/solicitar_correccion_inmueble/${id}/`,
    payload
  );
  return data;
};

// 🔹 Editar solicitud (opcional, según backend)
export const editarSolicitudInmueble = async (id, payload) => {
  const { data } = await instancia.patch(
    `inmueble/editar_inmueble/${id}`,
    payload
  );
  return data;
};

