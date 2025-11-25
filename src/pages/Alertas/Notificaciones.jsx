import { useEffect, useState } from "react";
import instancia from "../../api/axios"; // Asegúrate de importar tu instancia configurada
import { Bell, Calendar, CheckCircle, Info } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import SaaSModal from "../../components/SaaSModal";

export default function Notificaciones() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estado para el Modal SaaS
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState("");

    // Función para marcar una alerta individual como vista
    const marcarAlertaComoVista = async (alertaId) => {
        try {
            // Ajusta la URL según tu urls.py: path('alertas/<int:alerta_id>/marcar_estado/', ...)
            await instancia.patch(`/alertas/alertas/${alertaId}/marcar_estado/`, {
                estado_visto: 'visto'
            });
        } catch (error) {
            console.error(`Error al marcar alerta ${alertaId}:`, error);
        }
    };

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await instancia.get("/alertas/mis_alertas/");
            
            const loadedAlerts = data?.values?.alertas || [];
            setItems(loadedAlerts);

            // Marcar automáticamente como vistas las que estén en 'no_visto'
            const alertasNoVistas = loadedAlerts.filter(a => a.estado_visto === 'no_visto');
            
            if (alertasNoVistas.length > 0) {
                // Ejecutar en segundo plano para no bloquear la UI
                Promise.all(
                    alertasNoVistas.map(alerta => marcarAlertaComoVista(alerta.id))
                );
            }

        } catch (err) {
            console.error("Error cargando alertas:", err);
            
            // Interceptar error SaaS (403)
            if (err.response && err.response.status === 403) {
                const msg = err.response.data?.message || "Acceso restringido a notificaciones.";
                setUpgradeMessage(msg);
                setShowUpgradeModal(true);
                setError("No tienes acceso a este módulo.");
            } else {
                setError("No se pudieron cargar las notificaciones.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
            
            {/* Modal SaaS */}
            <SaaSModal 
                isOpen={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)}
                title="Función Premium"
                message={upgradeMessage}
                actionLabel="Ver Planes"
            />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-7 h-7 text-orange-600" /> 
                    Mis Notificaciones
                </h1>
                <p className="text-gray-500 mt-1">Mantente al día con tus contratos y pagos.</p>
            </div>

            <div className="space-y-4">
                {/* Estado de Carga */}
                {loading && (
                    <div className="text-center py-10 text-gray-500 animate-pulse">
                        Cargando tus alertas...
                    </div>
                )}

                {/* Estado de Error */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Lista de Alertas */}
                {!loading && !error && items.length > 0 && (
                    <div className="grid gap-4">
                        {items.map((alerta) => (
                            <div 
                                key={alerta.id} 
                                className={`
                                    relative bg-white border rounded-xl p-5 shadow-sm transition-all hover:shadow-md
                                    ${alerta.estado_visto === 'no_visto' ? 'border-l-4 border-l-orange-500' : 'border-gray-200'}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {/* Tipo de alerta (Badge pequeño) */}
                                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2 uppercase font-bold tracking-wider">
                                            {alerta.tipo_alerta.replace('_', ' ')}
                                        </span>
                                        
                                        {/* Mensaje Principal */}
                                        <p className="text-gray-800 font-medium text-lg leading-snug">
                                            {alerta.mensaje}
                                        </p>

                                        {/* Info del Contrato (si existe) */}
                                        {alerta.contrato && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Contrato #{alerta.contrato} • {alerta.contrato_tipo}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="ml-4 flex flex-col items-end text-gray-400">
                                        <div className="flex items-center gap-1 text-sm mb-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(alerta.fecha_programada).toLocaleDateString()}
                                        </div>
                                        <span className="text-xs">
                                            {new Date(alerta.fecha_programada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Lista Vacía */}
                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                            <CheckCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Estás al día</h3>
                        <p className="text-gray-500">No tienes notificaciones pendientes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}