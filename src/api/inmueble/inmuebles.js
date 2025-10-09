import instancia from "../axios";

const BASE = "inmueble/listar_inmuebles";

export const getInmuebles = (tipo) => {
  const url = tipo ? `${BASE}?tipo=${encodeURIComponent(tipo)}` : BASE;
  return instancia.get(url);

};
export const listarInmuebles = () => {
  return instancia.get("/inmueble/listar_anuncios_disponibles");
};

export const getInmuebleById = (id) => {
  return instancia.get(`inmueble/inmueble/${id}`);
};

