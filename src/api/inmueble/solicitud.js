// src/api/inmueble/solicitud.js
import instancia from "../axios";

/* =========================================================
   📊 ADMIN — GESTIÓN DE ESTADOS
========================================================= */

const pickLista = (data) => {
  if (Array.isArray(data?.values?.inmuebles)) return data.values.inmuebles;
  if (Array.isArray(data?.values)) return data.values;
  if (Array.isArray(data)) return data;
  return [];
};

// 🔹 Listar inmuebles filtrados por estado (pendiente, aprobado, rechazado)
export const getSolicitudesInmuebles = async (estado = "todos") => {
  const res = await instancia.get(`inmueble/listar_inmuebles/?estado=${estado}`);
  return { data: pickLista(res.data), raw: res.data };
};

// 🔹 Aprobar inmueble
export const aceptarInmueble = (id) =>
  instancia.patch(`inmueble/aceptar_inmueble/${id}/`);

// 🔹 Rechazar inmueble (permite enviar motivo)
export const rechazarInmueble = (id, motivo = "") =>
  instancia.patch(`inmueble/rechazar_inmueble/${id}/`, { motivo });

// 🔹 Cambiar estado genérico
export const cambiarEstadoInmueble = async (id, estado, motivo = "") => {
  if (estado === "aprobado") return aceptarInmueble(id);
  if (estado === "rechazado") return rechazarInmueble(id, motivo);
  throw new Error("Estado inválido: usa 'aprobado' o 'rechazado'.");
};

// 🔹 Corregir y reenviar inmueble (desde el agente)
export const corregirYReenviarInmueble = (id) =>
  instancia.patch(`inmueble/corregir_reenviar_inmueble/${id}/`);
// 🔹 Listar inmuebles del agente autenticado
export const getInmueblesByAgente = async () => {
  const { data } = await instancia.get("inmueble/listar_inmuebles_agente/");
  return data;
};


