// src/pages/Citas/components/CitaFormModal.jsx
import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { crearCita } from "../../../api/cita";
import { getUsuarios } from "../../../api/usuarios/usuarios";
 

/* ===============================
   Helpers para datos de usuarios
================================ */
function normalizeUsersPayload(payload) {
  // Acepta {values:{usuarios:[...]}} | {values:[...]} | {results:[...]} | [...]
  if (!payload) return [];
  const v = payload.values ?? payload;
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.usuarios)) return v.usuarios;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  return [];
}

function isCliente(user) {
  const g1 = user?.grupo?.nombre;
  const g2 = user?.grupo_nombre;
  const g3 = user?.group_name;
  const g = (g1 || g2 || g3 || "").toString().toLowerCase();
  return g.includes("cliente"); // intenta detectar el grupo "Cliente"
}

function displayName(u) {
  return (
    u?.nombre ||
    (u?.first_name && u?.last_name ? `${u.first_name} ${u.last_name}` : null) ||
    u?.username ||
    `#${u?.id}`
  );
}

/* ===============================
   Helpers de formato fecha/hora
================================ */
function toISODate(d) {
  if (!d) return d;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d; // YYYY-MM-DD
  // dd/mm/yyyy o dd-mm-yyyy
  const m = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  }
  return d;
}
function toTimeHHMMSS(t) {
  if (!t) return t;
  // HH:MM o HH:MM:SS
  const mm = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (mm) {
    const hh = String(mm[1]).padStart(2, "0");
    const mi = String(mm[2]).padStart(2, "0");
    const ss = String(mm[3] ?? "00").padStart(2, "0");
    return `${hh}:${mi}:${ss}`;
  }
  return t;
}

export default function CitaFormModal({ onClose, onCreated }) {
  const [saving, setSaving] = useState(false);

  // clientes
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [errorClientes, setErrorClientes] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha_cita: "",
    hora_inicio: "",
    hora_fin: "",
    cliente: "",
  });

  useEffect(() => {
    (async () => {
      setLoadingClientes(true);
      setErrorClientes(null);
      try {
        const { data } = await getUsuarios();
        const arr = normalizeUsersPayload(data);
        // si detectamos el grupo, mostramos solo clientes; si no, mostramos todos
        const onlyClients = arr.filter(isCliente);
        setClientes(onlyClients.length ? onlyClients : arr);
      } catch (e) {
        console.error("[CitaFormModal] getUsuarios error:", e);
        setErrorClientes("No se pudo cargar la lista de clientes.");
        setClientes([]);
      } finally {
        setLoadingClientes(false);
      }
    })();
  }, []);

  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Normaliza y valida antes de enviar
      const fechaISO = toISODate(form.fecha_cita);
      const hi = toTimeHHMMSS(form.hora_inicio);
      const hf = toTimeHHMMSS(form.hora_fin);

      if (hi && hf && hi >= hf) {
        alert("La hora de inicio debe ser menor que la hora fin.");
        setSaving(false);
        return;
      }

      const payload = {
        titulo: form.titulo?.trim(),
        descripcion: form.descripcion?.trim() || "",
        fecha_cita: fechaISO,
        hora_inicio: hi,
        hora_fin: hf,
        cliente: form.cliente ? Number(form.cliente) : null,
      };

      console.log("[crearCita] payload", payload);
      const r = await crearCita(payload);
      console.log("[crearCita] ok", r?.data);
      onCreated?.();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("[crearCita] error", status, data);
      let msg = "No se pudo crear la cita. Revisa los datos.";
      if (data?.errors) msg += " " + JSON.stringify(data.errors);
      else if (data?.detail) msg += " " + String(data.detail);
      else if (typeof data === "string") msg += " " + data;
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const noHayClientes = !loadingClientes && clientes.length === 0;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-[680px] max-w-[94vw] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Nueva cita</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm">Título</label>
            <input
              name="titulo"
              value={form.titulo}
              onChange={change}
              className="w-full rounded-xl border p-2"
              required
            />
          </div>

          <div>
            <label className="text-sm">Fecha</label>
            <input
              type="date"
              name="fecha_cita"
              value={form.fecha_cita}
              onChange={change}
              className="w-full rounded-xl border p-2"
              required
            />
          </div>

          <div>
            <label className="text-sm">Hora inicio</label>
            <input
              type="time"
              name="hora_inicio"
              value={form.hora_inicio}
              onChange={change}
              className="w-full rounded-xl border p-2"
              required
            />
          </div>

          <div>
            <label className="text-sm">Hora fin</label>
            <input
              type="time"
              name="hora_fin"
              value={form.hora_fin}
              onChange={change}
              className="w-full rounded-xl border p-2"
              required
            />
          </div>

          <div>
            <label className="text-sm">Cliente</label>

            {loadingClientes && (
              <div className="text-xs text-slate-500 mb-1">Cargando clientes…</div>
            )}
            {errorClientes && (
              <div className="text-xs text-rose-600 mb-1">{errorClientes}</div>
            )}

            <select
              name="cliente"
              value={form.cliente}
              onChange={change}
              className="w-full rounded-xl border p-2"
              required
              disabled={loadingClientes || noHayClientes}
            >
              <option value="">
                {noHayClientes ? "No hay clientes disponibles" : "Seleccione…"}
              </option>
              {clientes.map((u) => (
                <option key={u.id} value={u.id}>
                  {displayName(u)}
                </option>
              ))}
            </select>

            {noHayClientes && (
              <div className="text-xs text-slate-500 mt-1">
                Crea clientes primero (Usuarios → Nuevo cliente).
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-sm">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={change}
              className="w-full rounded-xl border p-2 min-h-24"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100"
            >
              Cancelar
            </button>
            <button
              disabled={saving || loadingClientes || noHayClientes}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Crear cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
