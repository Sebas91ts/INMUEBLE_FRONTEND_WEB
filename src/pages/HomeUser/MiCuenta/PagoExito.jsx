// src/pages/Pagos/PagoExito.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Asumimos que esta API verifica el estado final del pago en el backend
// (Ej: GET /pago/confirmar-estado/:pagoId/)
import { getEstadoPagoFinal } from '../../api/pago/pago'; // Debes definir esta API

export default function PagoExito() {
    // Captura el ID del pago que Stripe añadió a la URL
    const { pagoId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null); // 'success', 'failed', 'processing'
    const [mensaje, setMensaje] = useState('Verificando el estado de su pago...');

    useEffect(() => {
        if (!pagoId) {
            setStatus('failed');
            setMensaje('Error: No se encontró la referencia del pago.');
            setLoading(false);
            return;
        }

        // Función para consultar el estado final de la transacción
        const verificarPago = async () => {
            try {
                // 💡 Lógica: Llama al backend para que verifique si el webhook se recibió 
                // y si el estado del Pago en la DB es 'confirmado'.
                const response = await getEstadoPagoFinal(pagoId);

                if (response.data.status === 'CONFIRMADO') {
                    setStatus('success');
                    setMensaje('¡Pago confirmado! Su contrato se marcará como activo.');
                } else {
                    setStatus('processing'); // O 'fallido' si el backend ya sabe que falló
                    setMensaje('El pago está en proceso de verificación final.');
                }
            } catch (err) {
                setStatus('failed');
                setMensaje('Hubo un error al verificar su pago en el sistema.');
            } finally {
                setLoading(false);
            }
        };

        verificarPago();
    }, [pagoId]);

    const handleGoToContratos = () => {
        // Redirigir al cliente a su vista principal de contratos
        navigate('/home/mis-contratos-cliente');
    };

    const StatusIcon = status === 'success' ? CheckCircle : XCircle;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl text-center">
                
                {loading ? (
                    <>
                        <Loader2 className="w-10 h-10 mx-auto mb-4 text-blue-600 animate-spin" />
                        <h2 className="text-xl font-semibold text-gray-800">Verificando Pago...</h2>
                        <p className="text-sm text-gray-500 mt-2">No cierre esta ventana.</p>
                    </>
                ) : (
                    <>
                        <StatusIcon 
                            className={`w-12 h-12 mx-auto mb-4 ${status === 'success' ? 'text-green-500' : 'text-red-500'}`} 
                        />
                        <h2 className="text-2xl font-bold mb-3">
                            {status === 'success' ? 'Transacción Exitosa' : 'Transacción Fallida'}
                        </h2>
                        <p className="text-gray-600 mb-6">{mensaje}</p>
                        
                        <button 
                            onClick={handleGoToContratos}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Ir a Mis Contratos
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}