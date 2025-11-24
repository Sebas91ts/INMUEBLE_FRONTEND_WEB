// src/pages/HomeUser/MiCuenta/ContratoCard.jsx (CÓDIGO FINAL COMPLETO)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { FileText, CheckCircle2 } from 'lucide-react';
// Asumo que iniciarPagoStripe está disponible/importado
import { iniciarPagoStripe } from '../../../api/pago/pago'; 
// 🚨 Importar el Modal para el botón PAGAR
import ModalPagos from './ModalPagos'; 

// --- Sub-componente InfoItem (Detalles de la tabla) ---
const InfoItem = ({ label, value }) => (
    <div className="text-sm">
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="font-medium text-gray-900">{value || 'N/A'}</dd>
    </div>
);

// --- Sub-componente Item del Historial de Pago ---
const PagoRealizadoItem = ({ pago }) => {
    // Protección contra pago nulo
    if (!pago || !pago.id) return null;
    
    const isConfirmed = pago.estado === 'confirmado'; 
    const fecha = pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
    const monto = parseFloat(pago.monto_pagado || 0).toFixed(2);
    
    return (
        <div className="p-1.5 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 text-sm font-semibold ${isConfirmed ? 'text-green-600' : 'text-yellow-600'}`}>
                    <CheckCircle2 className="w-4 h-4" /> Pago #{pago.id}
                </span>
                <span className="font-bold text-gray-800">${monto}</span>
            </div>
            <p className="text-xs text-gray-500 ml-6">{fecha}</p>
            <button className="text-xs text-blue-600 hover:underline mt-1 self-start">
                Ver o Descargar Comprobante...
            </button>
        </div>
    );
};


// --- Componente Principal ContratoCard ---
export default function ContratoCard({ contrato, onRefresh }) {
    // 🚨 Nuevo estado para controlar la visibilidad del modal
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 
    
    // --- DATOS PROCESADOS DEL HOOK ---
    const isFullyPaid = contrato.pago_completo;
    const montoPendiente = contrato.saldo_restante ? contrato.saldo_restante.toFixed(2) : '0.00';
    const hasHistory = contrato.historial_pagos?.length > 0;
    
    // Determinación de estado para el renderizado
    let estadoDisplay = contrato.estado;
    let estadoClase = 'bg-gray-200 text-gray-800';
    let showPagarButton = false;
    
    if (contrato.estado === 'pendiente') {
        estadoDisplay = 'Pendiente de Pago';
        estadoClase = 'bg-yellow-200 text-yellow-800';
        showPagarButton = true;
    } else if (contrato.estado === 'activo' && isFullyPaid) {
        estadoDisplay = 'Activo';
        estadoClase = 'bg-green-100 text-green-800';
    } else if (contrato.estado === 'finalizado') {
        estadoDisplay = 'Finalizado';
        estadoClase = 'bg-blue-100 text-blue-700';
    }
    
    // 🚨 Función para abrir el modal (en lugar de iniciar Stripe)
    const handlePagarClick = () => { 
        setIsModalOpen(true);
    };

    const handleVerHistorial = () => { navigate(`/home/mis-pagos/${contrato.id}/historial`); };


    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 grid grid-cols-1 lg:grid-cols-3 gap-0">
            
            {/* COLUMNA 1 & 2: RESUMEN Y DETALLES (2/3 de ancho) */}
            <div className="lg:col-span-2 p-6">
                <div className="flex items-start justify-between border-b pb-4 mb-4">
                    <div className="flex flex-col">
                         <h2 className="text-xl font-bold text-gray-900">
                            Resumen del Contrato
                         </h2>
                         <p className="text-sm text-gray-600">
                            Propiedad en: {contrato.inmueble_direccion || 'No especificada'}
                         </p>
                    </div>
                    
                    {/* BOTÓN DE ACCIÓN / ETIQUETA */}
                    <div className="flex-shrink-0">
                        {showPagarButton ? (
                            <button 
                                onClick={handlePagarClick} // 🚨 Llama al Modal
                                className="bg-blue-600 text-white font-bold py-2 px-4 text-sm rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                                disabled={loading}
                            >
                                PAGAR
                            </button>
                        ) : (
                            <span className={`px-4 py-1 text-xs font-semibold rounded-full ${estadoClase}`}>
                                {estadoDisplay}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* DETALLES DEL CONTRATO (GRID 3x2) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-base">
                    <InfoItem label="ID de Contrato" value={contrato.contrato_display_id || `#${contrato.id}`} />
                    <InfoItem label="Fecha de Inicio" value={contrato.fecha_inicio || 'N/A'} />
                    <InfoItem label="Fecha de Fin" value={contrato.fecha_fin || 'N/A'} />
                    <InfoItem label="Monto Total" value={`$${contrato.monto_total?.toFixed(2) || '0.00'}`} />
                    <InfoItem label="Saldo Restante" value={`$${montoPendiente}`} />
                    <InfoItem label="Estado" value={estadoDisplay} />
                </div>
            </div>

            {/* COLUMNA 3: HISTORIAL DE PAGOS (1/3 de ancho) */}
            <div className="lg:col-span-1 p-6 bg-gray-50 rounded-r-xl border-l border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Pagos Realizados</h4>
                <div className="space-y-3">
                    {hasHistory ? (
                        contrato.historial_pagos.slice(0, 3).map(p => (
                            <PagoRealizadoItem key={p.id} pago={p} />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No hay pagos registrados.</p>
                    )}
                </div>
                {hasHistory && contrato.historial_pagos.length > 3 && (
                    <button onClick={handleVerHistorial} className="mt-3 text-sm text-blue-600 hover:underline">
                        Ver más pagos ({contrato.historial_pagos.length})
                    </button>
                )}
            </div>
            
            {/* 🚨 RENDERIZAR EL MODAL DE PAGOS */}
            {isModalOpen && (
                <ModalPagos 
                    contrato={contrato}
                    onClose={() => setIsModalOpen(false)}
                    // onRefresh es para recargar la lista de pagos después de subir el comprobante
                    onPaymentSuccess={onRefresh} 
                />
            )}
        </div>
    );
}