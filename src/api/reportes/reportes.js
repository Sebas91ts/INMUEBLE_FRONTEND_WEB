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


// ============================================
// OBTENER REPORTES
// ============================================

export const getDashboard = async () => {
  return instancia.get('reportes/dashboard/');
};

export const getReporteInmuebles = async (params = {}) => {
  return instancia.get('reportes/inmuebles/', { params });
};

export const getReporteContratos = async (params = {}) => {
  return instancia.get('reportes/contratos/', { params });
};

export const getReporteAgentes = async (params = {}) => {
  return instancia.get('reportes/agentes/', { params });
};

export const getReporteFinanciero = async (params = {}) => {
  return instancia.get('reportes/financiero/', { params });
};

export const getReporteAlertas = async (params = {}) => {
  return instancia.get('reportes/alertas/', { params });
};

export const getReporteUsuarios = async (params = {}) => {
  return instancia.get('reportes/usuarios/', { params });
};

export const getReporteAnuncios = async (params = {}) => {
  return instancia.get('reportes/anuncios/', { params });
};

export const getReporteComunicacion = async (params = {}) => {
  return instancia.get('reportes/comunicacion/', { params });
};

export const getReporteComparativo = async (params = {}) => {
  return instancia.get('reportes/comparativo/', { params });
};

// ============================================
// EXPORTAR REPORTES
// ============================================

/**
 * Función auxiliar para descargar archivos
 */
const descargarArchivo = (blob, nombreArchivo) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Exportar reporte a PDF
 * @param {string} tipoReporte - dashboard, inmuebles, contratos, etc.
 * @param {object} params - Parámetros del reporte
 */
export const exportarReportePDF = async (tipoReporte, params = {}) => {
  const response = await instancia.get(`reportes/${tipoReporte}/`, {
    params: { ...params, formato: 'pdf' },
    responseType: 'blob'
  });
  
  const fecha = new Date().toISOString().split('T')[0];
  descargarArchivo(response.data, `reporte_${tipoReporte}_${fecha}.pdf`);
  
  return response;
};

/**
 * Exportar reporte a Excel
 * @param {string} tipoReporte - dashboard, inmuebles, contratos, etc.
 * @param {object} params - Parámetros del reporte
 */
export const exportarReporteExcel = async (tipoReporte, params = {}) => {
  const response = await instancia.get(`reportes/${tipoReporte}/`, {
    params: { ...params, formato: 'excel' },
    responseType: 'blob'
  });
  
  const fecha = new Date().toISOString().split('T')[0];
  descargarArchivo(response.data, `reporte_${tipoReporte}_${fecha}.xlsx`);
  
  return response;
};