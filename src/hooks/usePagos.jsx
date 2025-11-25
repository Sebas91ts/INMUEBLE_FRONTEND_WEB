import { useState, useEffect } from 'react';
import { pagosAPI } from '../api/pago_alquiler/pago_alquiler';

export const usePagos = (contratoId) => {
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarEstadoCuenta = async () => {
    try {
      setLoading(true);
      const response = await pagosAPI.getEstadoCuentaAlquiler(contratoId);
      
      if (response.data.status === 1) {
        setEstadoCuenta(response.data.values);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Error en la respuesta del servidor');
      }
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar estado de cuenta';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const iniciarPagoStripe = async () => {
    try {
      setLoading(true);
      const response = await pagosAPI.iniciarPagoStripe(contratoId);
      
      // Redirigir a Stripe si hay URL
      if (response.data.values?.url_checkout) {
        window.location.href = response.data.values.url_checkout;
      }
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al iniciar pago';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Simular pago exitoso
  const simularPagoExitoso = async (pagoId) => {
    try {
      setLoading(true);
      const response = await pagosAPI.simularWebhook(pagoId);
      
      if (response.data.status === 1) {
        // Mostrar mensaje de éxito
        console.log('✅ Pago simulado exitosamente:', response.data.message);
      } else {
        throw new Error(response.data.message || 'Error en la simulación');
      }
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al simular pago';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const verificarPago = async (pagoId) => {
    try {
      const response = await pagosAPI.verificarEstadoPago(pagoId);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al verificar pago';
      throw new Error(errorMsg);
    }
  };

  // Cargar estado de cuenta al montar
  useEffect(() => {
    if (contratoId) {
      cargarEstadoCuenta();
    }
  }, [contratoId]);

  return {
    estadoCuenta,
    loading,
    error,
    cargarEstadoCuenta,
    iniciarPagoStripe,
    simularPagoExitoso,  // ✅ Exportar nueva función
    verificarPago,
  };
};