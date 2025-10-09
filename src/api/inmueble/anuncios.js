// usa tu instancia axios existente en src/api/axios.js
//src/api/inmueble/anuncios.js
/* =========================================================
   📢 ANUNCIOS / PUBLICACIONES DISPONIBLES
========================================================= */
import instancia from "../axios";
// Listar anuncios disponibles (público)
export const getAnunciosDisponibles = () => instancia.get("inmueble/listar_anuncios_disponibles");

// Alias más descriptivo
export const listarInmueblesDisponibles = () => instancia.get("inmueble/listar_anuncios_disponibles");