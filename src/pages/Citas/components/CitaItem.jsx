export default function CitaItem({
  cita,
  onDelete,
  onReschedule,
  onOpenInfo,
  canUpdate = true,
  canDelete = true,
}) {
  const rango = `${cita.hora_inicio} - ${cita.hora_fin}`;

  // bloquear eliminación si ya venció
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const nowTime = today.toTimeString().slice(0, 8);
  const vencida =
    cita.fecha_cita < todayStr ||
    (cita.fecha_cita === todayStr && (cita.hora_fin || "00:00:00") <= nowTime);

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 cursor-pointer"
      onClick={() => onOpenInfo?.(cita)}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-slate-900">{cita.titulo}</div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {cita.estado}
        </span>
      </div>

      {cita.descripcion && (
        <div className="text-sm text-slate-600 mt-0.5">{cita.descripcion}</div>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-1">
        <div className="inline-flex items-center gap-1">📅 {cita.fecha_cita}</div>
        <div className="inline-flex items-center gap-1">🕒 {rango}</div>
        <div className="inline-flex items-center gap-1">
          👤 {cita.cliente_nombre || `Cliente #${cita.cliente}`}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
        {canUpdate && (
          <button
            onClick={onReschedule}
            className="text-xs px-2 py-1 rounded-lg bg-sky-100 hover:bg-sky-200"
          >
            Reprogramar
          </button>
        )}

        {canDelete && !vencida && (
          <button
            onClick={onDelete}
            className="text-xs px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200"
          >
            Eliminar
          </button>
        )}
        {(!canDelete || vencida) && (
          <span className="text-[11px] text-slate-400">
            {!canDelete ? "(sin permiso)" : "(no eliminable vencida)"}
          </span>
        )}
      </div>
    </div>
  );
}
