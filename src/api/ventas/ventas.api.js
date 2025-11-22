// src/api/ventas/ventas.api.js
import axios from "../axios"; // axios con interceptor

// Función para obtener token actual
const getToken = () => localStorage.getItem("access_token");

// =============================================
// 1️⃣ Crear orden Stripe
// =============================================
export const crearOrdenStripe = async (inmueble_id) => {
  const token = getToken();

  const { data } = await axios.post(
    "/ventas/stripe/crear-orden/",
    { inmueble_id },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  return data;
};

// =============================================
// 2️⃣ Confirmar pago (pruebas)
// =============================================
export const confirmarPagoStripe = async (session_id) => {
  const token = getToken();

  const { data } = await axios.post(
    "/ventas/stripe/confirmar-pago/",
    { session_id },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  return data;
};

// =============================================
// 3️⃣ Venta en efectivo
// =============================================
export const registrarVentaEfectivo = async (inmueble_id) => {
  const token = getToken();

  const { data } = await axios.post(
    "/ventas/efectivo/",
    { inmueble_id },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  return data;
};

// =============================================
// 4️⃣ Historial de compras
// =============================================
export const obtenerHistorialCompras = async () => {
  const token = getToken();

  const { data } = await axios.get("/ventas/historial/compras/", {
    headers: { Authorization: `Token ${token}` },
  });

  return data;
};

// =============================================
// 5️⃣ Historial general admin
// =============================================
export const obtenerHistorialGeneral = async () => {
  const token = getToken();

  const { data } = await axios.get("/ventas/historial/general/", {
    headers: { Authorization: `Token ${token}` },
  });

  return data;
};
