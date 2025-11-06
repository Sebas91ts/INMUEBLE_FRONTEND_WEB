import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Bell, Calendar } from "lucide-react";

// NOTA IMPORTANTE: La ruta POST /alertas/{id}/visto/ debe estar definida en el backend.

export default function Notificaciones({ token }) {
    // Eliminamos el estado 'tab' ya que no habrá filtros
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false); 

    // Función para marcar una alerta como vista en el backend
    const marcarAlertaComoVista = async (alertaId) => {
        try {
            await axios.post(`/alertas/${alertaId}/visto/`, {}, {
                headers: { Authorization: `Token ${token}` },
            });
        } catch (error) {
            console.error(`Error al marcar alerta ${alertaId} como vista:`, error);
        }
    };

    const load = async () => {
        setLoading(true);
        try {
            // CAMBIO CLAVE: Llamamos a la API sin ningún filtro ('?filtro=todos' o 'visto=...')
            // Esto asume que el backend, por defecto, devuelve todas las alertas del usuario si no se especifica filtro.
            const { data } = await axios.get(`/alertas/mis_alertas/`, { 
                headers: { Authorization: `Token ${token}` },
            });
            
            const loadedAlerts = data?.values || [];
            
            // 1. Establecer los ítems en el estado
            setItems(loadedAlerts);

            // 2. MARCAR COMO VISTO: Marcamos todas las alertas cargadas como vistas
            // ya que el usuario las está viendo en este listado.
            if (loadedAlerts.length > 0) {
                await Promise.all(
                    loadedAlerts.map(alerta => marcarAlertaComoVista(alerta.id))
                );
            }

        } catch (error) {
            console.error("Error al cargar mis alertas:", error);
            setItems([]); 
        } finally {
            setLoading(false);
        }
    };
    
    // Solo cargamos una vez al montar el componente (eliminamos la dependencia [tab])
    useEffect(() => { load(); /* eslint-disable-next-line */ }, []); 


    // ELIMINADA: La función badgeUX ya no es necesaria, la quitamos del código.

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold flex items-center gap-2 mb-4">
                <Bell className="w-6 h-6" /> Mis Notificaciones
            </h1>

            {/* ELIMINADO: Quitamos el bloque de pestañas de filtrado */}

            <div className="space-y-3">
                {/* INDICADOR DE CARGA */}
                {loading && <div className="text-slate-500 p-4">Cargando notificaciones...</div>}

                {/* LISTADO DE ITEMS */}
                {!loading && items.map(a => (
                    <div key={a.id} className="border rounded-xl p-4 bg-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="font-medium">{a.titulo}</div>
                                {a.descripcion && <div className="text-slate-500 text-sm">{a.descripcion}</div>}
                                <div className="mt-1 text-slate-600 text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {/* Muestra la fecha en formato local */}
                                    {new Date(a.due_date).toLocaleDateString()}
                                </div>
                            </div>
                            {/* ELIMINADO: Quitamos la llamada al badge (etiqueta de estado) aquí. */}
                        </div>
                    </div>
                ))}
                
                {/* MENSAJE DE LISTA VACÍA */}
                {!loading && items.length===0 && (
                    <div className="text-slate-500 border rounded-xl p-4">Sin notificaciones.</div>
                )}
            </div>
        </div>
    );
}