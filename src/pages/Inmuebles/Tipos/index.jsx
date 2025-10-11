// src/pages/Inmuebles/Tipos/index.jsx
import { useEffect, useMemo, useState } from "react";
import {
  listarTipos,
  crearTipo,
  actualizarTipo,
  eliminarTipo,
  activarTipo,
} from "../../../api/inmueble/tipos";
import TipoForm from "./TipoForm";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  RefreshCw,
  Search,
  X as Close,
  Building2,
} from "lucide-react";

export default function TiposInmueble() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await listarTipos();
      setTipos(data?.values?.tipo_inmueble || []);
    } catch (e) {
      setErr("No se pudo cargar el listado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return tipos;
    return tipos.filter(
      (t) =>
        t.nombre.toLowerCase().includes(q) ||
        (t.descripcion || "").toLowerCase().includes(q)
    );
  }, [busqueda, tipos]);

  const counts = useMemo(() => {
    const total = tipos.length;
    const activos = tipos.filter((t) => t.is_active).length;
    return { total, activos, inactivos: total - activos };
  }, [tipos]);

  const handleCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await actualizarTipo(editing.id, payload);
      } else {
        await crearTipo(payload);
      }
      setOpen(false);
      setEditing(null);
      fetchData();
    } catch {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Desactivar este tipo?")) return;
    await eliminarTipo(id);
    fetchData();
  };

  const handleActivar = async (id) => {
    await activarTipo(id);
    fetchData();
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <Building2 className="h-4 w-4" />
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
            Gestionar Propiedad
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 active:scale-[.98]"
            title="Actualizar listado"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-800 active:scale-[.98]"
          >
            <Plus className="h-4 w-4" />
            Nuevo tipo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Activos" value={counts.activos} variant="success" />
        <StatCard label="Inactivos" value={counts.inactivos} variant="muted" />
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o descripción…"
            className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-9 text-sm outline-none ring-stone-900/10 focus:ring-2"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-2 top-1.5 rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
              title="Limpiar"
            >
              <Close className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Errors */}
      {err && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Table / Loading / Empty */}
      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <EmptyState onCreate={handleCreate} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <Th>#</Th>
                <Th>Nombre</Th>
                <Th>Descripción</Th>
                <Th>Estado</Th>
                <Th align="right">Acciones</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((t, idx) => (
                <tr
                  key={t.id}
                  className="hover:bg-stone-50/60 transition-colors"
                >
                  <Td>{idx + 1}</Td>
                  <Td className="font-medium text-stone-900">{t.nombre}</Td>
                  <Td>{t.descripcion}</Td>
                  <Td>
                    {t.is_active ? (
                      <Pill color="green">Activo</Pill>
                    ) : (
                      <Pill color="stone">Inactivo</Pill>
                    )}
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1.5">
                      <IconBtn
                        onClick={() => handleEdit(t)}
                        title="Editar"
                        variant="ghost"
                      >
                        <Edit className="h-4 w-4" />
                      </IconBtn>

                      {t.is_active ? (
                        <IconBtn
                          onClick={() => handleEliminar(t.id)}
                          title="Desactivar"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      ) : (
                        <IconBtn
                          onClick={() => handleActivar(t.id)}
                          title="Activar"
                          variant="ghost"
                        >
                          <Power className="h-4 w-4" />
                        </IconBtn>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
              <h3 className="text-base font-semibold text-stone-900">
                {editing ? "Editar tipo" : "Nuevo tipo"}
              </h3>
              <button
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
                className="rounded-lg border border-stone-200 px-2 py-1 text-stone-600 hover:bg-stone-50"
                title="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="px-4 py-4">
              <TipoForm
                initial={editing}
                loading={saving}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- UI helpers ---------- */

function StatCard({ label, value, variant = "default" }) {
  const styles = {
    default:
      "bg-white border-stone-200 text-stone-900",
    success:
      "bg-green-50 border-green-200 text-green-800",
    muted:
      "bg-stone-50 border-stone-200 text-stone-700",
  }[variant];

  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm ${styles} flex items-center justify-between`}
    >
      <span className="text-sm">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th className={`px-3 py-2 text-${align} text-xs font-semibold uppercase tracking-wide`}>
      {children}
    </th>
  );
}

function Td({ children, align = "left", className = "" }) {
  return (
    <td className={`px-3 py-3 text-${align} text-stone-700 ${className}`}>
      {children}
    </td>
  );
}

function Pill({ children, color = "stone" }) {
  const map = {
    green: "bg-green-100 text-green-700",
    stone: "bg-stone-100 text-stone-700",
  }[color];
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${map}`}>
      {children}
    </span>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-lg border border-stone-200 p-2 text-stone-700 hover:bg-stone-50 active:scale-[.98]"
    >
      {children}
    </button>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-12 w-full animate-pulse border-b border-stone-100 bg-stone-50/60"
        />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-stone-300 bg-white py-14">
      <div className="text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-stone-100">
          <Building2 className="h-6 w-6 text-stone-600" />
        </div>
        <h4 className="text-stone-900 font-semibold">Sin resultados</h4>
        <p className="mt-1 text-sm text-stone-600">
          Crea un tipo de inmueble o ajusta tu búsqueda.
        </p>
        <button
          onClick={onCreate}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" />
          Nuevo tipo
        </button>
      </div>
    </div>
  );
}
