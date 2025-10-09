import instancia from "../axios";

// ya lo tienes
const BASE = "inmueble/listar_inmuebles";

// GET lista (con o sin ?tipo=)
export const getInmuebles = (tipo) => {
  const url = tipo ? `${BASE}?tipo=${encodeURIComponent(tipo)}` : BASE;
  return instancia.get(url);
};

// ✅ NUEVO: GET detalle por id
export const getInmuebleById = (id) => instancia.get(`inmueble/inmueble/${id}`);
// ajusta a tu ruta real si es distinta (p.ej. "inmueble/obtener/<id>")
