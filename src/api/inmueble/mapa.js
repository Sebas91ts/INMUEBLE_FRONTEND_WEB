// src/api/inmueble/mapa.js
import instancia from "../axios";

/**
 * Obtiene la lista ligera de inmuebles (solo coordenadas y datos básicos)
 * Endpoint: /inmueble/mapa-pines/
 */
export const getInmueblesMapa = async () => {
  try {
    // La URL debe coincidir con la que definiste en urls.py
    const { data } = await instancia.get("inmueble/mapa-pines/");
    return data; 
  } catch (error) {
    console.error("Error obteniendo pines del mapa:", error);
    return { status: 0, values: [] };
  }
};