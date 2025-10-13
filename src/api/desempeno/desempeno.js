// src/api/desempeno.js
import axios from "../axios";

// GET /api/desempeno/anuncios/agente/{id}/
export const getDesempenoAgente = (agenteId) =>
  axios.get(`api/desempeno/anuncios/agente/${agenteId}/`);

// POST /api/desempeno/reporte_ia_gemini/
export const postReporteIAGemini = (payload) =>
  axios.post(`api/desempeno/reporte_ia_gemini/`, payload);
