// src/api/inmuebles.js
import API from "./axios"; // ya lo tienes; debe inyectar el Token en headers

export async function listarTiposInmueble() {
  const { data } = await API.get("/inmueble/listar_tipo_inmuebles");
  return data?.values?.tipo_inmueble ?? [];
}

export async function crearInmueble(payload) {
  // payload incluye fotos_urls: string[]
  const { data } = await API.post("/inmueble/agente_registrar_inmueble", payload);
  return data;
}
