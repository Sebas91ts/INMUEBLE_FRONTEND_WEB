    // src/hooks/useClienteContratos.jsx

    import { useState, useEffect, useCallback } from 'react';
    import { useAuth } from './useAuth';

    import { getMisContratosCliente } from '../api/contrato/contrato'; 
    import { listarPagosContrato } from '../api/pago/pago'; 

    export default function useClienteContratos() {
        const { user } = useAuth();
        const [loading, setLoading] = useState(true);
        const [contratosCliente, setContratosCliente] = useState([]);
        const [error, setError] = useState(null);

        const fetchContratos = useCallback(async () => {
            if (!user || user.grupo_nombre?.toLowerCase() !== 'cliente') {
                setContratosCliente([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // ===== 1. Obtener datos del backend =====
                const response = await getMisContratosCliente();
                const data = response.data ?? {};

                // 🚨 Compatibilidad con cualquier forma que devuelva el backend
                const misContratos =
        Array.isArray(data?.values?.contratos)
            ? data.values.contratos
        : Array.isArray(data?.contratos)
            ? data.contratos
        : Array.isArray(data)
            ? data
        : [];


                if (!Array.isArray(misContratos)) {
                    setContratosCliente([]);
                    return;
                }

                // ===== 2. Obtener historial de pagos por contrato =====
                let contratosConPagos = [];

                for (const contrato of misContratos) {
                    let pagos = [];

                    try {
                        const pagosResponse = await listarPagosContrato(contrato.id);
                        pagos = pagosResponse.data?.values ?? [];
                    } catch (errorPagos) {
                        console.warn(`⚠ Error cargando pagos del contrato ${contrato.id}`);
                    }

                    // ===== 3. Calcular montos =====
                    const montoTotal = parseFloat(contrato.monto) || 0;
                    const montoPagado = pagos
                        .filter(p => p.estado === 'confirmado')
                        .reduce((sum, p) => sum + parseFloat(p.monto_pagado), 0);

                    contratosConPagos.push({
                        ...contrato,
                        historial_pagos: pagos,
                        monto_pagado: montoPagado,
                        monto_total: montoTotal,
                        saldo_restante: montoTotal - montoPagado,
                        pago_completo: montoPagado >= montoTotal,
                        
                    });
                }

                setContratosCliente(contratosConPagos);

            } catch (err) {
                console.error("🚨 Error cargando contratos del cliente:", err);
                setError("Error al cargar datos o pagos.");
            } finally {
                setLoading(false);
            }
        }, [user]);

        useEffect(() => {
            if (user) fetchContratos();

            const intervalId = setInterval(fetchContratos, 30000);
            return () => clearInterval(intervalId);

        }, [fetchContratos, user]);

        return {
            loading,
            error,
            contratosCliente,
            fetchContratos,
        };
    }
