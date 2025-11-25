import instancia from "../axios";

/**
 * Obtiene la lista de planes disponibles desde el backend
 * GET /suscripciones/planes/
 */
export const getPlanes = async () => {
  try {
    const { data } = await instancia.get("suscripciones/planes/");
    return data;
  } catch (error) {
    console.error("Error obteniendo planes:", error);
    return { status: 0, values: [] };
  }
};

/**
 * Inicia el proceso de pago. Envía el ID del plan y recibe la URL de Stripe.
 * POST /suscripciones/pagar/
 */
export const iniciarPagoSuscripcion = async (planId) => {
  try {
    const { data } = await instancia.post("suscripciones/pagar/", {
      plan_id: planId,
    });
    return data;
  } catch (error) {
    console.error("Error iniciando pago:", error);
    throw error; // Lanzamos el error para manejarlo en el componente
  }
};

/**
 * Confirma la suscripción (Simulación o Webhook trigger desde el front)
 * POST /suscripciones/confirmar-simulado/
 */
export const confirmarPagoFrontend = async () => {
  try {
    const { data } = await instancia.post("suscripciones/confirmar-simulado/");
    return data;
  } catch (error) {
    console.error("Error confirmando pago:", error);
    return { status: 0, message: "Error de conexión" };
  }
};

/**
 * Obtiene el estado actual de la suscripción del usuario
 * GET /suscripciones/mi-estado/
 */
export const getMiSuscripcion = async () => {
  try {
    const { data } = await instancia.get("suscripciones/mi-estado/");
    return data;
  } catch (error) {
    return { status: 0, values: null };
  }
};