// usa tu instancia axios existente en src/api/axios.js
import instancia from "../axios";

export const getAnunciosDisponibles = () =>
  instancia.get("inmueble/listar_anuncios_disponibles");
