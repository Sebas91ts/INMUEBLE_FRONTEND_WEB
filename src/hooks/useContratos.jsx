import { useState, useEffect } from 'react';
import { pagosAPI } from '../api/pago_alquiler/pago_alquiler';

export const useContratos = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  const cargarContratosAlquiler = async () => {
    try {
      setLoading(true);
      const response = await pagosAPI.listarContratosAlquiler();
      
      if (response.data.status === 1) {
        setContratos(response.data.values.contratos || []);
        setCount(response.data.values.count || 0);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Error en la respuesta del servidor');
      }
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar contratos';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Cargar automáticamente al montar
  useEffect(() => {
    cargarContratosAlquiler();
  }, []);

  return {
    contratos,
    count,
    loading,
    error,
    cargarContratosAlquiler,
  };
};