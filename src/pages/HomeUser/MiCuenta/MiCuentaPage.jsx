// src/pages/HomeUser/MiCuenta/MiCuentaPage.jsx (COMPLETO PARA REEMPLAZAR)

import React from 'react';
import useClienteContratos from '../../../hooks/useClienteContratos'; // Hook con la lógica de filtro y pago
import { Loader2, Info } from 'lucide-react'; 
import ContratoCard from './ContratoCard'; // Importar el componente de la tarjeta (Final)
// Asumimos que los subcomponentes Spinner e Info están definidos o importados globalmente

export default function MiCuentaPage() {
    // El hook devuelve la lista filtrada, procesada y lista para renderizar
    const { loading, error, contratosCliente } = useClienteContratos();
    
    // Mostramos la lista completa que devuelve el hook (activo, finalizado, pendiente)
    const contratos_a_mostrar = contratosCliente; 

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Panel de Mi Cuenta
            </h1>
            
            {/* 1. Estado de Carga */}
            {loading && (
                <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="mt-2 text-gray-600">Cargando datos de contratos y pagos...</p>
                </div>
            )}
            
            {/* 2. Mensaje de Error/Vacío */}
            {!loading && (error || contratos_a_mostrar.length === 0) && (
                <div className="p-6 bg-white rounded-lg shadow-md text-center text-gray-500 border border-dashed border-gray-300">
                    {error ? (
                        <div className="text-red-500 font-bold">{error}</div>
                    ) : (
                        <>
                            <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No se encontraron contratos de anticrético o alquiler vinculados a tu cuenta.</p>
                        </>
                    )}
                </div>
            )}

            {/* 3. Renderizado de Contratos (Maestro-Detalle) */}
            {!loading && !error && contratos_a_mostrar.length > 0 && (
                <div className="space-y-8">
                    {contratos_a_mostrar.map(contrato => (
                        <ContratoCard 
                            key={contrato.id} 
                            contrato={contrato} 
                            // onRefresh es pasado si el Card necesita recargar los datos
                        />
                    ))}
                </div>
            )}
        </div>
    );
}