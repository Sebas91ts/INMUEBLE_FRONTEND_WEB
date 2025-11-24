// src/api/pago/pago.js

import instancia from "../axios"; // ⬅️ Asegúrate que la ruta sea correcta

/**
 * [CU32 Cliente] Inicia el proceso de pago electrónico de un contrato.
 * POST /pago/contratos/:contratoId/stripe/iniciar/
 */
export const iniciarPagoStripe = (contratoId, metodo) => {
    return instancia.post(`pago/contratos/${contratoId}/stripe/iniciar/`, {
        metodo: metodo,
        // Nota: El monto lo calcula el backend con el contratoId.
    });
};

/**
 * [CU32 Cliente/Admin] Lista el historial de pagos de un contrato.
 * GET /pago/contratos/:contratoId/
 */

// src/api/pago/pago.js
export const listarPagosContrato = async (contratoId) => {
    const response = await instancia.get(`pago/contratos/${contratoId}/`);
    return response.data; // <--- Debe devolver response.data
};

/**
 * [CU32 Cliente/Admin] Obtiene el detalle de un pago específico.
 * GET /pago/detalle/:pagoId/
 */
export const getDetallePago = (pagoId) => {
    return instancia.get(`pago/detalle/${pagoId}/`);
};

/**
 * [CU32 Admin] Registra un pago manual/QR y sube el comprobante (Multipart).
 * POST /pago/contratos/:contratoId/manual/
 */
export const registrarPagoManual = (contratoId, formData) => {
    // Axios necesita Content-Type 'multipart/form-data' para archivos
    return instancia.post(`pago/contratos/${contratoId}/manual/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * [CU32 Admin] Confirma o rechaza un pago manual pendiente.
 * PATCH /pago/gestion/:pagoId/
 */
export const gestionarPagoManual = (pagoId, accion) => {
    return instancia.patch(`pago/gestion/${pagoId}/`, {
        accion: accion, // 'confirmar' o 'rechazar'
    });
};