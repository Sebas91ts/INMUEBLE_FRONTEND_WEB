// src/api/contratos/alquiler.js
import instancia from "../axios";

/**
 * 📄 Servicio API para Contratos de Alquiler
 * Gestiona la generación, listado y obtención de contratos PDF.
 * 
 * Todos los endpoints requieren autenticación JWT.
 */

//
// 🔹 1. Generar contrato de alquiler en PDF
//
export const generarContratoAlquiler = async (data) => {
  const res = await instancia.post("/contrato/generarContratoAlquilerPdf", data);
  return res; // ya no uses responseType blob porque devuelves JSON con pdf_url
};

//
// 🔹 2. Listar todos los contratos de alquiler del usuario logueado
//
// export const listarContratosAlquiler = async () => {
//   const response = await instancia.get("/contrato/listar");
//   return response.data;
// };
// src/api/contratos/alquiler.js
export const listarContratosAlquiler = async () => {
  const response = await instancia.get("/contrato/listar?tipo=alquiler");
  return response.data;
};

//
// 🔹 3. Obtener un contrato específico (por id)
//
export const obtenerContratoAlquiler = async (id) => {
  const response = await instancia.get(`/contrato/ver/${id}`, {
    responseType: "blob", // devuelve PDF o detalle
  });
  return response;
};


