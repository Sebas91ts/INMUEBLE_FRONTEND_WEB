// 1. Importamos la instancia central de Axios de tu proyecto
import instancia from "../axios"; // ⬅️ Asegúrate que la ruta sea correcta

/**
 * (AC 1 y 2) Busca un contrato por su ID
 * GET /contrato/detalle/:id/
 */
export const getContratoDetalle = (contratoId) => {
  // La URL es relativa a la baseURL de Axios (http://127.0.0.1:8000/)
  // El interceptor de Axios añadirá el token automáticamente
  return instancia.get(`contrato/detalle/${contratoId}/`);
};

/**
 * (AC 3) Aprueba un contrato pendiente
 */
export const aprobarContrato = (contratoId) => {
  return instancia.patch(`contrato/aprobar/${contratoId}/`);
};

/**
 * (AC 4 y 5) Finaliza un contrato activo
 */
export const finalizarContrato = (contratoId) => {
  return instancia.patch(`contrato/finalizar/${contratoId}/`);
};

/**
 * Descarga el PDF del contrato
 */
export const descargarContratoPDF = (contratoId) => {
  return instancia.get(`contrato/descargar-pdf/${contratoId}/`, {
    // 2. Le decimos a Axios que la respuesta será un archivo (blob)
    responseType: 'blob',
  });
};

/*
 * Crea un nuevo contrato de anticrético
 */
export const crearContratoAnticretico = (data) => {
  return instancia.post(`contrato/crear-contrato-anticretico/`, data);
};

export const getListaContratosAnticretico = () => {
  return instancia.get(`contrato/listar-anticretico/`);
};

export const getInmueblesDisponibles = () => {
  return instancia.get('inmueble/listar_anuncios_disponibles');
};

export const getUsuarios = () => {
  return instancia.get('usuario/listar_usuarios');
};

export const getAgentes = () => {
  return instancia.get('usuario/listar-agentes');
};