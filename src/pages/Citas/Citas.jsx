import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { listarCitas, eliminarCita, reprogramarCita } from "../../api/cita";
import CitaFormModal from "./components/CitaFormModal";
import SingleCalendar from "./components/SingleCalendar";
import CitaItem from "./components/CitaItem";
import ReprogramarModal from "./components/ReprogramarModal";
import CitaInfoModal from "./components/CitaInfoModal";
import { usePrivilegios } from "../../hooks/usePrivilegios";

function groupByDate(citas) {
  const map = new Map();
  for (const c of citas) {
    const d = c.fecha_cita;
    if (!map.has(d)) map.set(d, []);
    map.get(d).push(c);
  }
  return map;
}

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [tab, setTab] = useState("cal"); // cal | list
  const [openModal, setOpenModal] = useState(false);
  const [formDate, setFormDate] = useState(null);
  const [repCita, setRepCita] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [infoCita, setInfoCita] = useState(null);

  // --- Privilegios ---
  const { privilegios } = usePrivilegios();
  const hasPriv = (nombre, accion) =>
    privilegios?.some(
      (p) =>
        p.componente?.toLowerCase() === nombre.toLowerCase() &&
        ((accion === "leer" && p.puede_leer) ||
          (accion === "crear" && p.puede_crear) ||
          (accion === "actualizar" && p.puede_actualizar) ||
          (accion === "eliminar" && p.puede_eliminar))
    );

  const canCreate = hasPriv("Cita", "crear");
  const canUpdate = hasPriv("Cita", "actualizar");
  const canDelete = hasPriv("Cita", "eliminar");

  async function cargar() {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await listarCitas();
      const arr = data?.values?.citas ?? [];
      setCitas(Array.isArray(arr) ? arr : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo cargar el listado de citas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const byDate = useMemo(() => groupByDate(citas), [citas]);

  const proximas = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return [...citas]
      .filter((c) => c.fecha_cita >= hoy)
      .sort((a, b) => (a.fecha_cita + a.hora_inicio).localeCompare(b.fecha_cita + b.hora_inicio))
      .slice(0, 10);
  }, [citas]);

  const onCreated = () => {
    setOpenModal(false);
    setFormDate(null);
    cargar();
  };

  const handleDelete = async (id) => {
    try {
      if (!canDelete) throw new Error("No tienes permisos para ELIMINAR Cita.");
      if (!confirm("¿Eliminar esta cita definitivamente?")) return;
      await eliminarCita(id);
      await cargar();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "No se pudo eliminar.");
    }
  };

  const handleReprogramar = async (cita, campos) => {
    try {
      if (!canUpdate) throw new Error("No tienes permisos para ACTUALIZAR Cita.");
      await reprogramarCita(cita.id, campos);
      await cargar();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "No se pudo reprogramar.");
    }
  };

  const handleDayClick = (dateStr) => {
    setFormDate(dateStr);
    setOpenModal(true);
    setSelectedDate(dateStr);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-semibold text-slate-900">Citas</h1>

        {canCreate && (
          <button
            onClick={() => { setFormDate(null); setOpenModal(true); }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Nueva cita
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setTab("cal")}
            className={"relative py-3 text-sm font-medium " + (tab === "cal" ? "text-sky-600" : "text-slate-500 hover:text-slate-700")}
          >
            Calendario
            {tab === "cal" && <span className="absolute left-0 -bottom-px h-[2px] w-full bg-sky-600 rounded-full" />}
          </button>
          <button
            onClick={() => setTab("list")}
            className={"relative py-3 text-sm font-medium " + (tab === "list" ? "text-sky-600" : "text-slate-500 hover:text-slate-700")}
          >
            Lista
            {tab === "list" && <span className="absolute left-0 -bottom-px h-[2px] w-full bg-sky-600 rounded-full" />}
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      {tab === "cal" ? (
        <>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <SingleCalendar byDate={byDate} onDayClick={handleDayClick} />
            </div>

            {/* Próximas citas */}
            <div className="w-full lg:w-[420px] rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
              <h2 className="text-[17px] font-semibold mb-3 text-slate-900">Próximas citas</h2>
              {loading ? (
                <div className="py-10 text-center text-slate-500">Cargando…</div>
              ) : err ? (
                <div className="text-red-600">{err}</div>
              ) : proximas.length === 0 ? (
                <div className="text-slate-500">Sin citas próximas.</div>
              ) : (
                <div className="space-y-3">
                  {proximas.map((c) => (
                    <CitaItem
                      key={c.id}
                      cita={c}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      onReschedule={() => setRepCita(c)}
                      onDelete={() => handleDelete(c.id)}
                      onOpenInfo={(ct) => setInfoCita(ct)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lista del día seleccionado */}
          {selectedDate && (
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="w-4 h-4 text-slate-700" />
                <h3 className="font-semibold text-slate-900">Citas del {selectedDate}</h3>
              </div>
              <div className="space-y-3">
                {(byDate.get(selectedDate) ?? []).length === 0 ? (
                  <div className="text-slate-500 text-sm">No hay citas para este día.</div>
                ) : (
                  (byDate.get(selectedDate) ?? []).map((c) => (
                    <CitaItem
                      key={c.id}
                      cita={c}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      onReschedule={() => setRepCita(c)}
                      onDelete={() => handleDelete(c.id)}
                      onOpenInfo={(ct) => setInfoCita(ct)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          {loading ? (
            <div className="py-10 text-center text-slate-500">Cargando…</div>
          ) : err ? (
            <div className="text-red-600">{err}</div>
          ) : citas.length === 0 ? (
            <div className="text-slate-500">No hay citas.</div>
          ) : (
            <div className="space-y-3">
              {citas.map((c) => (
                <CitaItem
                  key={c.id}
                  cita={c}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onReschedule={() => setRepCita(c)}
                  onDelete={() => handleDelete(c.id)}
                  onOpenInfo={(ct) => setInfoCita(ct)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal crear */}
      {openModal && (
        <CitaFormModal
          defaultDate={formDate}
          onClose={() => { setOpenModal(false); setFormDate(null); }}
          onCreated={onCreated}
        />
      )}

      {/* Modal reprogramar */}
      {repCita && (
        <ReprogramarModal
          cita={repCita}
          onClose={() => setRepCita(null)}
          onDone={async (campos) => {
            await handleReprogramar(repCita, campos);
            setRepCita(null);
          }}
        />
      )}

      {/* Modal info */}
      {infoCita && (
        <CitaInfoModal id={infoCita.id} onClose={() => setInfoCita(null)} />
      )}
    </div>
  );
}
