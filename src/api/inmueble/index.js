// src/api/inmueble/index.js
import instancia from "../axios";
/* =========================================================
   🏠 INMUEBLES — CRUD BÁSICO
========================================================= */

// Listar todos los inmuebles (puede filtrar por tipo)
export const getInmuebles = (tipo) => {
  const url = tipo ? `inmueble/listar_inmuebles?tipo=${encodeURIComponent(tipo)}` : "inmueble/listar_inmuebles";
  return instancia.get(url);
};

// Obtener inmueble por ID
export const getInmuebleById = (id) => instancia.get(`inmueble/inmueble/${id}`);

// Crear nuevo inmueble (usado por agentes)
export const crearInmueble = async (payload) => {
  const { data } = await instancia.post("inmueble/agente_registrar_inmueble", payload);
  return data;
};

// Actualizar inmueble (opcional si existe endpoint PUT)
export const actualizarInmueble = async (id, payload) => {
  const { data } = await instancia.put(`inmueble/${id}/`, payload);
  return data;
};

// Eliminar inmueble
export const eliminarInmueble = async (id) => instancia.delete(`inmueble/${id}/`);

/* =========================================================
   🏷️ TIPOS DE INMUEBLE
========================================================= */

// Listar tipos de inmueble
export const listarTiposInmueble = async () => {
  const { data } = await instancia.get("inmueble/listar_tipo_inmuebles");
  return data?.values?.tipo_inmueble ?? [];
};

// 🏠 Publicar inmueble (agente)
export const publicarInmueble = async (id) => {
  const { data } = await instancia.post(`inmueble/publicar_inmueble/${id}`);
  return data;
};
