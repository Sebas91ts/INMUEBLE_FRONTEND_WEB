// src/api/desempeno.js
import axios from "../axios";

// GET /api/desempeno/anuncios/agente/{id}/
export const getDesempenoAgente = (agenteId) =>
  axios.get(`api/desempeno/anuncios/agente/${agenteId}/`);
