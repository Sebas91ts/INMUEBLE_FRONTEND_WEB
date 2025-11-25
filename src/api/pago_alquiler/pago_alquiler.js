import instancia from "../axios";

export const pagosAPI = {
  // Estado de cuenta - CORREGIDO: usar 'pago' (singular) y contrato_id como entero
  getEstadoCuentaAlquiler: (contratoId) => 
    instancia.get(`pago/contrato/alquiler/${contratoId}/estado-cuenta/`),

  // Iniciar pago Stripe - CORREGIDO
  iniciarPagoStripe: (contratoId) => 
    instancia.post(`pago/contratos/${contratoId}/stripe/iniciar/`),

  // Verificar estado de pago específico - CORREGIDO
  verificarEstadoPago: (pagoId) => 
    instancia.get(`pago/verificar/${pagoId}/`),

  // Listar pagos del contrato - CORREGIDO
  listarPagosContrato: (contratoId) => 
    instancia.get(`pago/contratos/${contratoId}/`),

  // Registrar pago manual (admin)
  registrarPagoManual: (contratoId, data) => 
    instancia.post(`/pago/contrato/${contratoId}/registrar-manual/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Gestionar pago (admin)
  gestionarPago: (pagoId, accion) => 
    instancia.patch(`/pago/${pagoId}/gestionar/`, { accion }),
  
  listarContratosAlquiler: () => 
    instancia.get('contrato/cliente/alquileres/'),
   simularWebhook: (pagoId) => 
    instancia.post(`pago/simular-webhook/${pagoId}/`),
};