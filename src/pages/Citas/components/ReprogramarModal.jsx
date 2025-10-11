import { useState } from "react";
import { XIcon } from "lucide-react";
import { reprogramarCita } from "../../../api/cita";

export default function ReprogramarModal({ cita, onClose, onDone }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fecha_cita: cita?.fecha_cita ?? "",
    hora_inicio: cita?.hora_inicio ?? "",
    hora_fin: cita?.hora_fin ?? "",
  });
  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reprogramarCita(cita.id, form);
      onDone?.();
    } catch (err) {
      const msg = err?.response?.data?.errors
        ? JSON.stringify(err.response.data.errors)
        : "No se pudo reprogramar la cita.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="w-[560px] max-w-[94vw] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Reprogramar cita</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Nueva fecha</label>
            <input type="date" name="fecha_cita" value={form.fecha_cita} onChange={change} required className="w-full rounded-xl border p-2" />
          </div>
          <div>
            <label className="text-sm">Hora inicio</label>
            <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={change} required className="w-full rounded-xl border p-2" />
          </div>
          <div>
            <label className="text-sm">Hora fin</label>
            <input type="time" name="hora_fin" value={form.hora_fin} onChange={change} required className="w-full rounded-xl border p-2" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100">Cancelar</button>
            <button disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
              {saving ? "Guardando…" : "Reprogramar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
