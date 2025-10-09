// 📁 src/api/inmuebles/inmuebles.js
import instancia from "../axios";

// 🔹 Utilidad para normalizar la respuesta del backend
const pickLista = (data) => {
  if (Array.isArray(data?.values?.inmuebles)) return data.values.inmuebles;
  if (Array.isArray(data?.values)) return data.values;
  if (Array.isArray(data)) return data;
  return []; // fallback
};

// 🔹 Listar inmuebles filtrados por estado
// estado puede ser: pendiente | aprobado | rechazado | todos
export const getSolicitudesInmuebles = async (estado = "todos") => {
  const res = await instancia.get(`inmueble/listar_inmuebles/?estado=${estado}`);
  return { data: pickLista(res.data), raw: res.data };
};

// 🔹 Aceptar inmueble
export const aceptarInmueble = async (id) => {
  return instancia.patch(`inmueble/aceptar_inmueble/${id}/`);
};

// 🔹 Rechazar inmueble
export const rechazarInmueble = async (id) => {
  return instancia.patch(`inmueble/rechazar_inmueble/${id}/`);
};

// 🔹 Cambiar estado (wrapper conveniente)
export const cambiarEstadoInmueble = async (id, estado) => {
  if (estado === "aprobado") return aceptarInmueble(id);
  if (estado === "rechazado") return rechazarInmueble(id);
  throw new Error("Estado inválido: usa 'aprobado' o 'rechazado'.");
};

// 🔹 (Opcional) Listar anuncios publicados/disponibles
// export const getInmueblesDisponibles = async () => {
//   const res = await instancia.get("inmueble/listar_anuncios_disponibles/");
//   return { data: pickLista(res.data), raw: res.data };
// };


