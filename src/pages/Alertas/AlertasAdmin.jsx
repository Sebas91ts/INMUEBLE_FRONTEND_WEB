// src/pages/Alertas/AlertasAdmin.jsx (CÓDIGO FINAL PARA REEMPLAZAR)

import { useEffect, useState, useCallback } from "react";
// Importar TODAS las funciones necesarias
import { enviarAvisoInmediato, correrScan, listarAlertasAdmin } from "../../api/alertas/alertas"; 
import { Calendar, Bell, Send, Zap } from "lucide-react"; 
import toast from 'react-hot-toast'; 
import { useAuth } from '../../hooks/useAuth'  
    
export default function AlertasAdmin() {
    const { token } = useAuth();   // <-- obtener token desde el contexto
    const [tab, setTab] = useState("todos");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para modales (Crear manual omitido por simplicidad)
    const [openAviso, setOpenAviso] = useState(false);
    const [aviso, setAviso] = useState({ 
        titulo: "", 
        descripcion: "", 
        grupos_destino: [], 
    });
    
    // Lista de grupos comunes (Nombres de grupo que el backend espera)
    const GRUPOS_COMUNES = [
        { nombre_back: 'cliente', nombre_front: 'Clientes' },
        { nombre_back: 'agente', nombre_front: 'Agentes' },
        { nombre_back: 'administrador', nombre_front: 'Administradores' },
    ];
    
    // -----------------------------------------------------------
    // FUNCIÓN PRINCIPAL DE CARGA (CORREGIDA)
    // -----------------------------------------------------------

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            

            // 1. Mapeo de pestañas a parámetros de backend (estado_envio)
            let estadoFiltro;
            if (tab === 'proximos') {
                estadoFiltro = 'pendiente'; 
            } else if (tab === 'vencidos') {
                // El backend usa 'fallido' para los envíos no exitosos (simula vencido)
                estadoFiltro = 'fallido'; 
            } 
            // Si tab === 'todos', estadoFiltro será undefined.
            
            const params = estadoFiltro ? { estado: estadoFiltro } : {};

            // 🟢 LLAMADA FINAL A LA API DEL ADMIN: Usa el token implícito de axios/instancia
            const response = await listarAlertasAdmin(params);
            const listaAlertas = response.data?.values?.alertas || [];
            // 🟢 IMPORTANTE: El backend devuelve data.values.alertas
            setItems(listaAlertas);

        } catch(e) {
             console.error("Error al cargar alertas del historial para Admin:", e);
             // console.log("Intenta iniciar sesión como administrador y verifica el permiso 'Alerta'.");
             toast.error("Error al cargar alertas del historial. Acceso denegado o conexión fallida.");
             setItems([]);
        } finally { setLoading(false); }
    }, [tab, token]);

    // Ejecutar carga al montar y cada vez que 'tab' o 'token' cambian
    useEffect(() => { 
        cargar(); 
    }, [cargar]); 
    
    // -----------------------------------------------------------
    // SUBMIT DE FORMULARIOS Y LÓGICA AUXILIAR
    // -----------------------------------------------------------

    const ejecutarScan = async () => {
        if (loading || isSubmitting) return;
        setLoading(true);
        setIsSubmitting(true);
        try {
            // Llama al endpoint del Cron Job
            const { data } = await correrScan(); 
            toast.success(`Escáner ejecutado. Alquiler: ${data.values.alquiler_alertas}, Anticrético: ${data.values.anticretico_alertas}.`);
            cargar(); 
        } catch (error) {
            toast.error("Hubo un error al ejecutar el escáner.");
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };
    
    const submitCrear = async (e) => { e.preventDefault(); /* Lógica omitida */ cargar(); };

    const submitAviso = async (e) => {
        e.preventDefault();
        if (!aviso.titulo || aviso.grupos_destino.length === 0) {
            toast.error("Debe ingresar un título y seleccionar al menos un grupo.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                grupos: aviso.grupos_destino, 
                mensaje: aviso.descripcion || aviso.titulo, 
            };
            
            await enviarAvisoInmediato(payload);
            toast.success(`Aviso enviado a ${aviso.grupos_destino.join(', ')}.`);
            
            setOpenAviso(false);
            setAviso({ titulo:"", descripcion:"", grupos_destino:[] });
            cargar();

        } catch (error) {
            toast.error("Error al enviar el aviso. Verifique el rol.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleGroupToggle = (groupName) => {
        setAviso(prevAviso => {
            const currentGroups = prevAviso.grupos_destino;
            let newGroups = currentGroups.includes(groupName)
                ? currentGroups.filter(name => name !== groupName)
                : [...currentGroups, groupName];
            
            return { ...prevAviso, grupos_destino: newGroups };
        });
    };
    
    const badge = (estado, tipo) => { 
        let c = "bg-slate-100 text-slate-700";
        if (estado === "fallido") c = "bg-red-100 text-red-700"; 
        if (estado === "pendiente") c = "bg-amber-100 text-amber-700";
        if (estado === "enviado") c = "bg-emerald-100 text-emerald-700";

        const tipoMap = {
            'custom': 'Manual', 
            'pago_alquiler': 'Pago Alquiler', 
            'vencimiento_anticretico': 'Venc. Contrato',
            'aviso_admin': 'Aviso Masivo' 
        };

        return (
            <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${c}`}>{estado}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-800">
                    {tipoMap[tipo] || tipo}
                </span>
            </div>
        );
    };

    // -----------------------------------------------------------
    // RENDERIZADO
    // -----------------------------------------------------------

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Bell className="w-6 h-6" /> Gestión de Alertas
                </h1>
                <div className="flex gap-2">
                    {/* Botón para ejecutar el escáner (Cron Job) */}
                    <button onClick={ejecutarScan} className="btn-secondary flex items-center" disabled={loading || isSubmitting}>
                        <Zap className="w-4 h-4 mr-1" /> {loading || isSubmitting ? "Ejecutando..." : "Ejecutar Escáner"}
                    </button>

                    <button onClick={() => setOpenAviso(true)} className="btn flex items-center" disabled={isSubmitting}>
                        <Send className="w-4 h-4 mr-1" /> Aviso inmediato
                    </button>
                </div>
            </div>

            {/* Navegación por Pestañas */}
            <div className="bg-white rounded-xl border p-1 inline-flex mb-4">
                {["proximos","vencidos","todos"].map(t => (
                    <button key={t} onClick={()=>setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab===t ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-gray-100"}`}>
                        {t[0].toUpperCase()+t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Contenido de la Tabla/Lista */}
            <div className="space-y-3">
                {loading && <div className="text-slate-500">Cargando…</div>}
                {!loading && items.map(a => (
                    <div key={a.id} className="border rounded-xl p-4 bg-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="font-medium">{a.mensaje.substring(0, 50)}...</div>
                                {a.mensaje && <div className="text-slate-500 text-sm">{a.mensaje.substring(0, 100)}...</div>}
                                <div className="mt-1 text-slate-600 text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(a.fecha_programada).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {badge(a.estado_envio, a.tipo_alerta)} 
                            </div>
                        </div>
                    </div>
                ))}
                {!loading && items.length===0 && <div className="text-slate-500">Sin alertas.</div>}
            </div>

            {/* Modal de Aviso Inmediato */}
            {openAviso && (
                <div className="modal">
                    <form onSubmit={submitAviso} className="modal-card">
                        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Aviso Inmediato a Grupos</h2>
                        
                        <label className="label">Título</label>
                        <input 
                            className="input mb-3" 
                            value={aviso.titulo}
                            onChange={e => setAviso({...aviso, titulo: e.target.value})}
                            required
                        />
                        
                        <label className="label mt-3">Mensaje</label>
                        <textarea 
                            className="textarea" 
                            value={aviso.descripcion}
                            onChange={e => setAviso({...aviso, descripcion: e.target.value})}
                        />
                        
                        {/* === DESTINATARIOS (NOMBRES DE GRUPO) === */}
                        <div className="mt-4 border p-3 rounded-lg bg-gray-50">
                            <label className="label mb-2 font-semibold text-gray-800">
                                Destinatarios
                            </label>
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {GRUPOS_COMUNES.map(g => (
                                    <label key={g.nombre_back} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={aviso.grupos_destino.includes(g.nombre_back)}
                                            onChange={() => handleGroupToggle(g.nombre_back)}
                                            className="form-checkbox h-4 w-4 text-slate-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700">{g.nombre_front}</span>
                                    </label>
                                ))}
                            </div>
                            
                            <p className="text-xs text-slate-500 mt-3">
                                Los usuarios de los grupos seleccionados recibirán el aviso vía Push/Email.
                            </p>
                        </div>
                        {/* === FIN DESTINATARIOS === */}

                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={()=>setOpenAviso(false)} className="btn">Cancelar</button>
                            <button className="btn-primary flex items-center" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Enviando...' : (
                                    <>
                                        <Send className="w-4 h-4 mr-1 inline"/>Enviar
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}