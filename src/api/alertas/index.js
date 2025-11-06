import axios from "../axios"; // tu instancia base

const base = "/alertas";

// 1. CRUD de Alertas
export const listarAlertas = (token, filtro="proximos") =>
  axios.get(`${base}?filtro=${filtro}`, { headers: { Authorization: `Token ${token}` }});

export const crearAlerta = (token, payload) =>
  axios.post(`${base}/crear/`, payload, { headers: { Authorization: `Token ${token}` }});

export const marcarEnviada = (token, id) =>
  axios.patch(`${base}/${id}/mark`, {}, { headers: { Authorization: `Token ${token}` }});

// 2. Alertas Personalizadas e Inmediatas
export const avisarGrupos = (token, payload) =>
  axios.post(`${base}/avisar/`, payload, { headers: { Authorization: `Token ${token}` }});

// 3. Tarea Automática
export const correrScan = (token) =>
  axios.post(`${base}/run/`, {}, { headers: { Authorization: `Token ${token}` }});

// 4. Configuración por Contrato
export const getConfigContrato = (token, contratoId) =>
  axios.get(`${base}/config/${contratoId}/`, { headers: { Authorization: `Token ${token}` }});

export const updateConfigContrato = (token, contratoId, data) =>
  axios.patch(`${base}/config/${contratoId}/update`, data, { headers: { Authorization: `Token ${token}` }});

// 5. LISTADO DE ALERTAS PERSONALES (mis_alertas) <--- AÑADIDO
export const listarMisAlertas = (token, filtro="proximos") =>
  // La ruta del backend es: /alertas/mis_alertas/
  // Se añade el signo de interrogación para el parámetro 'filtro'
  axios.get(`${base}/mis_alertas/?filtro=${filtro}`, { headers: { Authorization: `Token ${token}` }});