import { useEffect, useState } from "react";
import { X, CalendarDays, Clock3, UserRound } from "lucide-react";
import { obtenerCita } from "../../../api/cita";

export default function CitaInfoModal({ id, onClose }) {
  const [cita, setCita] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await obtenerCita(id);
        if (!mounted) return;
        setCita(data?.values ?? null);
      } catch {
        if (!mounted) return;
        setErr("No se pudo cargar la cita.");
      }
    })();
    return () => (mounted = false);
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-[560px] max-w-[95vw] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Detalle de cita</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {err && <div className="text-rose-600">{err}</div>}

        {!cita ? (
          <div className="text-slate-500">Cargando…</div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="text-base font-medium text-slate-900">{cita.titulo}</div>
            <div className="text-slate-600">{cita.descripcion || "—"}</div>

            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              {cita.fecha_cita}
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="w-4 h-4" />
              {cita.hora_inicio} – {cita.hora_fin}
            </div>
            <div className="flex items-center gap-2">
              <UserRound className="w-4 h-4" />
              Cliente: {cita.cliente_nombre || `#${cita.cliente}`}
            </div>
            <div className="flex items-center gap-2">
              <UserRound className="w-4 h-4" />
              Agente: {cita.agente_nombre || `#${cita.agente}`}
            </div>

            <div className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {cita.estado}
            </div>

            <div className="text-[11px] text-slate-400">
              Creado: {new Date(cita.creado_en).toLocaleString()}
              {cita.actualizado_en &&
                ` · Actualizado: ${new Date(cita.actualizado_en).toLocaleString()}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
