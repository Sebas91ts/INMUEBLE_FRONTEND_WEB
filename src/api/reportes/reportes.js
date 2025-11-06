// src/api/reportes/reportes.js
import instancia from "../axios";  // Asumo que tienes tu instancia de axios aquí

// Esta es la de IA (la dejas)
export const generarReporteIA = (prompt) =>
  instancia.post("/reportes/generar-json/", { prompt });
  
// ✅ --- ESTA ES LA NUEVA FUNCIÓN ---
// Envía el objeto JSON simple, sin IA
export const generarReporteDirecto = (builderJson) =>
  instancia.post("/reportes/directo/", builderJson);

// Esta es la de exportar (la dejas)
export const exportarReporte = ({ data, formato, prompt }) =>
  instancia.post(
    "/reportes/exportar/",
    { data, formato, prompt },
    { responseType: "blob" }
  );