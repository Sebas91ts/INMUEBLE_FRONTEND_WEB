// src/pages/HomeUser/MiCuenta/ModalPagos.jsx (NUEVO ARCHIVO)

import React, { useState } from 'react';
import { iniciarPagoStripe, registrarPagoManual } from '../../../api/pago/pago'; // API's

// --- Simulación de Modal ---
export default function ModalPagos({ contrato, onClose, onPaymentSuccess }) {
    const [metodo, setMetodo] = useState('stripe'); // 'stripe' o 'transferencia'
    const [loading, setLoading] = useState(false);
    const [comprobanteFile, setComprobanteFile] = useState(null);
    const [montoManual, setMontoManual] = useState(contrato.saldo_restante);
    
    const montoDisplay = contrato.saldo_restante.toFixed(2);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        
        try {
            if (metodo === 'stripe') {
                // LLAMADA A LA PASARELA DE CRÉDITO
                const response = await iniciarPagoStripe(contrato.id, 'stripe');
                window.location.href = response.data.values.url_checkout; // Redirección
            } else if (metodo === 'transferencia' && comprobanteFile) {
                // LLAMADA A PAGO MANUAL (ADMIN/AGENTE)
                const formData = new FormData();
                formData.append('monto', montoManual);
                formData.append('metodo', 'transferencia');
                formData.append('comprobante', comprobanteFile);
                
                const response = await registrarPagoManual(contrato.id, formData);
                
                alert('Comprobante subido! Pendiente de revisión del administrador.');
                onPaymentSuccess(); // Refresca el estado de la lista
                onClose();
            }
        } catch (error) {
            alert('Error en el proceso de pago. Intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">Realiza tu Pago de forma Segura</h2>
                <form onSubmit={handleSubmit}>
                    
                    {/* Monto y Resumen */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold">Monto Total a Pagar: <span className="text-blue-700">${montoDisplay}</span></p>
                    </div>

                    {/* Selección de Método */}
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                            <input type="radio" value="stripe" checked={metodo === 'stripe'} onChange={() => setMetodo('stripe')} />
                            <span>Tarjeta de Crédito / Débito (Pasarela)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                            <input type="radio" value="transferencia" checked={metodo === 'transferencia'} onChange={() => setMetodo('transferencia')} />
                            <span>Transferencia Bancaria o Pago QR</span>
                        </label>
                    </div>

                    {/* Campos Condicionales */}
                    {metodo === 'transferencia' && (
                        <div className="mt-4 p-4 border border-gray-300 rounded-lg space-y-3">
                            <p className="text-sm font-semibold text-red-600">INSTRUCCIONES: Deposita ${montoDisplay} a la cuenta Nro: 123456 (Banco Falso).</p>
                            <label className="block text-sm font-medium text-gray-700">Subir Comprobante (Requerido)</label>
                            <input 
                                type="file" 
                                onChange={(e) => setComprobanteFile(e.target.files[0])}
                                required
                                className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
                            />
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border rounded-lg">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                            {loading ? 'Procesando...' : (metodo === 'stripe' ? 'Pagar y Redirigir' : 'Subir y Confirmar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}