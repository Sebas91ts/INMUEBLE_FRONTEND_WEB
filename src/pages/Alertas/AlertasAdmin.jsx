import { useEffect, useState } from "react";
// Asegúrate de que correrScan esté importada
import { listarAlertas, crearAlerta, avisarGrupos, marcarEnviada, correrScan } from "../../api/alertas"; 
import { Calendar, Bell, Send, Plus, Zap } from "lucide-react"; // Zap para el escáner

export default function AlertasAdmin({ token }) {
    const [tab, setTab] = useState("proximos");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Crear manual
    const [openCreate, setOpenCreate] = useState(false);
    const [form, setForm] = useState({ titulo: "", descripcion: "", due_date: "", tipo: "custom" });

    // Aviso inmediato
    const [openAviso, setOpenAviso] = useState(false);
    const [aviso, setAviso] = useState({ 
        titulo: "", 
        descripcion: "", 
        grupos_destino: [], // Usamos array para IDs seleccionados
        usuarios_destino: [] // Usamos array para IDs de usuario
    });
    
    // Lista hardcoded de grupos comunes (para evitar endpoint GET)
    const GRUPOS_COMUNES = [
        { id: 3, nombre: 'Clientes' },
        { id: 2, nombre: 'Agentes' },
        { id: 1, nombre: 'Administradores' },
    ];

    const cargar = async () => {
        setLoading(true);
        try {
            const { data } = await listarAlertas(token, tab);
            setItems(data?.values || []);
        } finally { setLoading(false); }
    };

    const ejecutarScan = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const { data } = await correrScan(token);
            // Mostrar un resumen de los envíos
            alert(`Escáner ejecutado. Correos enviados: ${data.values.email}, Push enviados: ${data.values.push}`);
            cargar();
        } catch (error) {
            alert("Hubo un error al ejecutar el escáner. Revise la consola del backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [tab]);

    const badge = (estado, tipo) => { // Acepta 'tipo' como argumento
        let c = "bg-slate-100 text-slate-700";
        if (estado === "vencido") c = "bg-red-100 text-red-700";
        if (estado === "pendiente") c = "bg-amber-100 text-amber-700";
        if (estado === "enviado") c = "bg-emerald-100 text-emerald-700";

        const tipoMap = {
            'custom': 'Manual', 
            'alquiler_cuota': 'Pago Alquiler', 
            'fin_contrato': 'Venc. Contrato'
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

    const submitCrear = async (e) => {
        e.preventDefault();
        if (!form.titulo || !form.due_date) return; 
        await crearAlerta(token, form);
        setOpenCreate(false);
        setForm({ titulo:"", descripcion:"", due_date:"", tipo:"custom" });
        cargar();
    };

    const submitAviso = async (e) => {
        e.preventDefault();
        if (!aviso.titulo) return;
        
        const payload = {
            ...aviso,
            grupos_destino: aviso.grupos_destino || [],
            usuarios_destino: aviso.usuarios_destino || [],
            canal_email: true, 
            canal_push: true
        };
        
        await avisarGrupos(token, payload);
        setOpenAviso(false);
        setAviso({ titulo:"", descripcion:"", grupos_destino:[], usuarios_destino:[] });
        cargar();
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Bell className="w-6 h-6" /> Alertas y Recordatorios
                </h1>
                <div className="flex gap-2">
                    {/* Botón para ejecutar el escáner */}
                    <button onClick={ejecutarScan} className="btn-secondary" disabled={loading}>
                        <Zap className="w-4 h-4 mr-1" /> {loading ? "Ejecutando..." : "Ejecutar Escáner"}
                    </button>

                    <button onClick={() => setOpenAviso(true)} className="btn">
                        <Send className="w-4 h-4 mr-1" /> Aviso inmediato
                    </button>
                    <button onClick={() => setOpenCreate(true)} className="btn-primary">
                        <Plus className="w-4 h-4 mr-1" /> Crear alerta
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border p-1 inline-flex mb-4">
                {["proximos","vencidos","todos"].map(t => (
                    <button key={t} onClick={()=>setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm ${tab===t ? "bg-slate-900 text-white" : ""}`}>
                        {t[0].toUpperCase()+t.slice(1)}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {loading && <div className="text-slate-500">Cargando…</div>}
                {!loading && items.map(a => (
                    <div key={a.id} className="border rounded-xl p-4 bg-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="font-medium">{a.titulo}</div>
                                {a.descripcion && <div className="text-slate-500 text-sm">{a.descripcion}</div>}
                                <div className="mt-1 text-slate-600 text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(a.due_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {badge(a.estado, a.tipo)} 
                                {a.estado !== "enviado" && (
                                    <button onClick={()=>marcarEnviada(token, a.id).then(cargar)}
                                            className="px-3 py-1 rounded-lg border text-sm hover:bg-slate-50">
                                        Marcar enviada
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {!loading && items.length===0 && <div className="text-slate-500">Sin alertas.</div>}
            </div>

            {/* Modal crear */}
            {openCreate && (
                <div className="modal">
                    <form onSubmit={submitCrear} className="modal-card">
                        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Crear Alerta Manual</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                            <label className="label">Título</label>
                            <input 
                                className="input" 
                                value={form.titulo}
                                onChange={e => setForm({ ...form, titulo: e.target.value })}
                                required
                            />
                            </div>
                            
                            <div>
                            <label className="label">Fecha Objetivo (due_date)</label>
                            <input 
                                type="date" 
                                className="input" 
                                value={form.due_date}
                                onChange={e => setForm({ ...form, due_date: e.target.value })}
                                required
                            />
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <label className="label">Descripción</label>
                            <textarea 
                            className="textarea" 
                            value={form.descripcion}
                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setOpenCreate(false)} className="btn">
                            Cancelar
                            </button>
                            <button className="btn-primary" type="submit">
                            Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal aviso inmediato - CORREGIDO CON CHECKBOXES */}
            {openAviso && (
                <div className="modal">
                    <form onSubmit={submitAviso} className="modal-card">
                        {/* Título y Separador */}
                        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Aviso Inmediato a Grupos</h2>
                        
                        <label className="label">Título</label>
                        <input 
                            className="input mb-3" 
                            value={aviso.titulo}
                            onChange={e => setAviso({...aviso,titulo:e.target.value})}
                            required
                        />
                        
                        <label className="label mt-3">Mensaje</label>
                        <textarea 
                            className="textarea" 
                            value={aviso.descripcion}
                            onChange={e => setAviso({...aviso,descripcion:e.target.value})}
                        />
                        
                        {/* === DESTINATARIOS (CHECKBOXES Y TEXTO) === */}
                        <div className="mt-4 border p-3 rounded-lg bg-gray-50">
                            <label className="label mb-2 font-semibold text-gray-800">
                                Destinatarios (Selección Manual)
                            </label>
                            
                            {/* Lista de Checkboxes para Grupos Comunes */}
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                                {GRUPOS_COMUNES.map(g => (
                                    <label key={g.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={aviso.grupos_destino.includes(g.id)}
                                            onChange={(e) => {
                                                const currentGroups = aviso.grupos_destino;
                                                let newGroups;
                                                if (e.target.checked) {
                                                    newGroups = [...currentGroups, g.id];
                                                } else {
                                                    newGroups = currentGroups.filter(id => id !== g.id);
                                                }
                                                setAviso({ ...aviso, grupos_destino: newGroups });
                                            }}
                                        />
                                        <span className="text-sm text-gray-700">{g.nombre} (ID: {g.id})</span>
                                    </label>
                                ))}
                            </div>
                            
                            {/* Campo de Usuarios Adicionales (Texto, para IDs) 
                            <div>
                                <label className="label mt-3">IDs de Usuarios Adicionales (separados por coma)</label>
                                <input 
                                    type="text" 
                                    className="input" 
                                    placeholder="Ej: 10, 15, 20"
                                    value={aviso.usuarios_destino.join(', ')}
                                    onChange={e => setAviso({
                                        ...aviso,
                                        usuarios_destino: e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0)
                                    })}
                                />
                            </div>*/}
                            
                            <p className="text-xs text-slate-500 mt-3">
                                Los miembros de los grupos seleccionados y los IDs de usuario recibirán el aviso.
                            </p>
                        </div>
                        {/* === FIN DESTINATARIOS === */}

                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={()=>setOpenAviso(false)} className="btn">Cancelar</button>
                            <button className="btn-primary" type="submit"><Send className="w-4 h-4 mr-1 inline"/>Enviar</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

/* Utilitarios Tailwind sugeridos:
.btn{ @apply px-3 py-2 rounded-lg border; }
.btn-primary{ @apply px-3 py-2 rounded-lg bg-slate-900 text-white; }
.btn-secondary{ @apply px-3 py-2 rounded-lg border bg-blue-500 text-white hover:bg-blue-600; }
.label{ @apply text-sm text-slate-600; }
.input{ @apply w-full border rounded-lg px-3 py-2; }
.textarea{ @apply w-full border rounded-lg px-3 py-2 min-h-[96px]; }
.modal{ @apply fixed inset-0 bg-black/40 grid place-items-center p-4 z-50; }
.modal-card{ @apply bg-white rounded-xl p-4 w-full max-w-lg shadow-lg; }
*/