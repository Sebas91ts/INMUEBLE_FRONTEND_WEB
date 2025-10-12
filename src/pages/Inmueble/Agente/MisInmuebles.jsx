// src/pages/Inmueble/Agente/MisInmuebles.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, X } from "lucide-react";

import { getMisInmuebles, getResumenMisInmuebles } from "../../../api/inmueble";
import { crearAnuncio, actualizarAnuncio } from "../../../api/inmueble/anuncios";

import InmuebleCard from "../../Inmuebles/components/InmuebleCard";
import ApprovalModal from "../../../components/AprovalModal";

const TABS = [
  { key: "aprobado", label: "Aprobados" },
  { key: "pendiente", label: "Pendientes" },
  { key: "rechazado", label: "Rechazados" },
  { key: "publicados", label: "Publicados" },
  { key: "todos", label: "Todos" },
];

export default function MisInmuebles() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("aprobado");
  const [inmuebles, setInmuebles] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  // Aside
  const [panelOpen, setPanelOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);

  // Modal OK
  const [okOpen, setOkOpen] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  // 🔄 fuerza a las viñetas a re-consultar /inmueble/anuncio/:anuncio_id/estado/
  const [refreshKey, setRefreshKey] = useState(0);
  const forceBadgesRefresh = () => setRefreshKey((v) => v + 1);

  // Habilita "Publicar" solo si existe anuncio y estado === "disponible"
  const puedePublicar = useMemo(() => {
    const st = String(sel?.anuncio?.estado || "").toLowerCase();
    return Boolean(sel?.anuncio?.id) && st === "disponible";
  }, [sel]);

  const loadData = async (estado) => {
    setLoading(true);
    try {
      const [listaRes, resumenRes] = await Promise.all([
        getMisInmuebles(estado),
        getResumenMisInmuebles(),
      ]);
      setInmuebles(listaRes?.data?.values?.inmuebles ?? []);
      setResumen(resumenRes?.data?.values ?? null);
      // cada vez que cambia la lista (tab) forzamos actualización de viñetas
      forceBadgesRefresh();
    } catch (err) {
      console.error("❌ Error cargando mis inmuebles:", err);
      setInmuebles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const badgeCount = (k) => {
    if (!resumen) return 0;
    const m = {
      aprobado: resumen.aprobados,
      pendiente: resumen.pendientes,
      rechazado: resumen.rechazados,
      publicados: resumen.publicados,
      todos: resumen.todos,
    };
    return m[k] ?? 0;
  };

  const openPanel = (item) => {
    setSel(item);
    setPanelOpen(true);
  };
  const closePanel = () => {
    setPanelOpen(false);
    setSel(null);
  };

  const patchInmuebleInList = (id, patch) => {
    setInmuebles((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  // Cambiar estado -> si no hay anuncio se crea y guardamos el id (para viñetas)
  const onCambiarEstado = async (nuevoEstado) => {
    if (!sel) return;
    try {
      setBusy(true);
      let resp;
      if (sel?.anuncio?.id) {
        resp = await actualizarAnuncio(sel.anuncio.id, { estado: nuevoEstado });
      } else {
        resp = await crearAnuncio(sel.id, nuevoEstado, true); // crea y devuelve id/estado/is_active
      }
      if (!(resp?.status === 1 && !resp?.error)) {
        throw new Error(resp?.message || "No se pudo actualizar el estado.");
      }

      const { values } = resp || {};
      const nextAnuncio = {
        id: values?.id ?? sel?.anuncio?.id ?? null,
        estado: (values?.estado || nuevoEstado) ?? null,
        is_active: typeof values?.is_active === "boolean" ? values.is_active : (sel?.anuncio?.is_active ?? true),
      };

      // refresca selección y lista
      setSel((prev) => ({ ...prev, anuncio: nextAnuncio }));
      patchInmuebleInList(sel.id, { anuncio: nextAnuncio });

      // fuerza a las viñetas a re-consultar por anuncio.id
      forceBadgesRefresh();

      setOkMsg("Estado del anuncio actualizado.");
      setOkOpen(true);
    } catch (e) {
      console.error("❌ Cambiar estado:", e);
      alert(e?.message || "No se pudo cambiar el estado.");
    } finally {
      setBusy(false);
    }
  };

  // Activar/Desactivar anuncio
  const onToggleActivo = async () => {
    if (!sel?.anuncio?.id) return;
    try {
      setBusy(true);
      const resp = await actualizarAnuncio(sel.anuncio.id, { is_active: !sel.anuncio.is_active });
      if (!(resp?.status === 1 && !resp?.error)) {
        throw new Error(resp?.message || "No se pudo actualizar activo/inactivo.");
      }

      const { values } = resp || {};
      const nextAnuncio = {
        id: values?.id ?? sel?.anuncio?.id,
        estado: values?.estado ?? sel?.anuncio?.estado,
        is_active: typeof values?.is_active === "boolean" ? values.is_active : !sel?.anuncio?.is_active,
      };

      setSel((prev) => ({ ...prev, anuncio: nextAnuncio }));
      patchInmuebleInList(sel.id, { anuncio: nextAnuncio });

      forceBadgesRefresh();

      setOkMsg(nextAnuncio.is_active ? "Anuncio activado." : "Anuncio desactivado.");
      setOkOpen(true);
    } catch (e) {
      console.error("❌ Toggle activo:", e);
      alert(e?.message || "No se pudo actualizar el anuncio.");
    } finally {
      setBusy(false);
    }
  };

  // Publicar (solo si estado === disponible)
  const onPublicar = async () => {
    if (!sel?.anuncio?.id) return;
    const st = String(sel.anuncio.estado || "").toLowerCase();
    if (st !== "disponible") return;

    try {
      setBusy(true);
      const resp = await actualizarAnuncio(sel.anuncio.id, { is_active: true });
      if (!(resp?.status === 1 && !resp?.error)) throw new Error(resp?.message || "No se pudo publicar.");

      const { values } = resp || {};
      const nextAnuncio = {
        id: values?.id ?? sel?.anuncio?.id,
        estado: values?.estado ?? sel?.anuncio?.estado,
        is_active: true,
      };

      setSel((prev) => ({ ...prev, anuncio: nextAnuncio }));
      patchInmuebleInList(sel.id, { anuncio: nextAnuncio });

      forceBadgesRefresh();

      setOkMsg("Anuncio publicado (Disponible y Activo).");
      setOkOpen(true);
    } catch (e) {
      console.error("❌ Publicar:", e);
      alert(e?.message || "No se pudo publicar.");
    } finally {
      setBusy(false);
    }
  };

  const goCrear = () => navigate("/home/mis-inmuebles/crear");

  return (
    <div className="p-6 relative">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">🏠 Mis Inmuebles</h1>
        <button
          onClick={goCrear}
          className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-white hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" />
          Crear inmueble
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full border transition-all ${
              tab === t.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
            }`}
          >
            {t.label}
            <span className="ml-2 text-xs font-semibold">{badgeCount(t.key)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-6 text-gray-600 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando inmuebles...
        </div>
      ) : inmuebles.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-stone-600">
          <p className="mb-4">No hay inmuebles en esta categoría.</p>
          <button
            onClick={goCrear}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-900 px-4 py-2 text-stone-900 hover:bg-stone-100"
          >
            <Plus className="h-4 w-4" />
            Crear inmueble
          </button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {inmuebles.map((it) => (
            <div key={it.id} className="flex flex-col gap-2">
              {/* 👉 Viñeta consulta por anuncio.id y se actualiza con refreshKey */}
              <InmuebleCard
                data={it}
                showBadge
                refreshKey={refreshKey}
                onClick={() => openPanel(it)}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => openPanel(it)}
                  className="px-3 py-2 rounded-lg bg-stone-900 text-white hover:opacity-90"
                >
                  Estado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {panelOpen && sel && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closePanel} />
          <aside className="fixed right-0 top-0 h-dvh w-full sm:w-[420px] z-50">
            <div className="h-full bg-white shadow-xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Acciones del anuncio</h3>
                <button onClick={closePanel} className="p-2 rounded-lg hover:bg-neutral-100" title="Cerrar">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-2 text-sm text-neutral-700">
                <div className="font-semibold">{sel?.titulo || "Sin título"}</div>
                <div className="text-neutral-500">
                  {sel?.ciudad || "—"} • {Number(sel?.precio || 0).toLocaleString()}
                </div>
              </div>

              <button
                onClick={onPublicar}
                disabled={!puedePublicar || busy}
                className={`mt-4 w-full h-[42px] rounded-lg text-sm font-semibold ${
                  puedePublicar && !busy
                    ? "bg-black text-white hover:opacity-90"
                    : "bg-neutral-800/10 text-neutral-700 cursor-not-allowed"
                }`}
              >
                Publicar
              </button>

              <div className="mt-4 text-xs text-neutral-600">Cambiar estado</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { k: "disponible", label: "Disponible" },
                  { k: "vendido", label: "Vendido" },
                  { k: "alquilado", label: "Alquilado" },
                  { k: "anticretico", label: "Anticrético" },
                ].map((btn) => {
                  const active = sel?.anuncio?.estado === btn.k;
                  const cls = active
                    ? "bg-neutral-200 cursor-default border-neutral-300"
                    : "bg-white hover:bg-neutral-100 border";
                  return (
                    <button
                      key={btn.k}
                      onClick={() => !active && !busy && onCambiarEstado(btn.k)}
                      disabled={active || busy}
                      className={`h-[38px] rounded-lg text-xs ${cls} border`}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <button
                  onClick={onToggleActivo}
                  disabled={busy || !sel?.anuncio?.id}
                  className={`w-full h-[38px] rounded-lg text-xs border ${
                    sel?.anuncio?.is_active
                      ? "border-red-600 text-red-600 hover:bg-red-50"
                      : "border-green-600 text-green-600 hover:bg-green-50"
                  } ${!sel?.anuncio?.id ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={!sel?.anuncio?.id ? "Primero define el estado del anuncio" : ""}
                >
                  {sel?.anuncio?.is_active ? "Desactivar anuncio" : "Activar anuncio"}
                </button>
              </div>

              <p className="mt-3 text-[11px] leading-snug text-neutral-500">
                * Las viñetas consultan el estado real por <b>anuncio.id</b>.
              </p>
            </div>
          </aside>
        </>
      )}

      <button
        onClick={() => navigate("/home/mis-inmuebles/crear")}
        className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full bg-stone-900 p-4 text-white shadow-lg hover:bg-stone-800"
        aria-label="Crear inmueble"
        title="Crear inmueble"
      >
        <Plus className="h-5 w-5" />
      </button>

      <ApprovalModal
        isOpen={okOpen}
        onClose={() => setOkOpen(false)}
        message={okMsg || "Operación realizada correctamente."}
      />
    </div>
  );
}
