// src/pages/Inmueble/Agente/MisInmuebles.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, X } from "lucide-react";

import { getMisInmuebles, getResumenMisInmuebles } from "../../../api/inmueble";
import { actualizarAnuncio, publicarInmueble } from "../../../api/inmueble/anuncios";

import InmuebleCard from "../../Inmuebles/components/InmuebleCard";
import ApprovalModal from "../../../components/AprovalModal";

const TABS = [
  { key: "aprobado", label: "Aprobados" },
  { key: "pendiente", label: "Pendientes" },
  { key: "rechazado", label: "Rechazados" },
  { key: "publicados", label: "Publicados" },
  { key: "todos", label: "Todos" },
];

// helpers de parseo
const pick = (resp) => resp?.data ?? resp ?? {};
const ok = (resp) => {
  const d = pick(resp);
  if (typeof d?.status !== "undefined") return d.status === 1 && !d.error;
  return true;
};
const valuesOf = (resp) => pick(resp)?.values ?? pick(resp);

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

  // refresco de badges
  const [refreshKey, setRefreshKey] = useState(0);
  const forceBadgesRefresh = () => setRefreshKey((v) => v + 1);

  // Habilita "Publicar" en el panel si el inmueble está aprobado:
  // - sin anuncio aún, o
  // - con anuncio en "disponible" (lo reactiva si estuviera inactivo)
  const puedePublicar = useMemo(() => {
    const estInm = String(sel?.estado || "").toLowerCase();
    if (estInm !== "aprobado") return false;
    const stAn = String(sel?.anuncio?.estado || "").toLowerCase();
    return !sel?.anuncio?.id || stAn === "disponible";
  }, [sel]);

  const loadData = async (estado) => {
    setLoading(true);
    try {
      const [listaRes, resumenRes] = await Promise.all([
        getMisInmuebles(estado),
        getResumenMisInmuebles(),
      ]);
      const listaVals = valuesOf(listaRes);
      const resumenVals = valuesOf(resumenRes);
      setInmuebles(listaVals?.inmuebles ?? []);
      setResumen(resumenVals ?? null);
      forceBadgesRefresh();
    } catch (err) {
      console.error("❌ Error cargando mis inmuebles:", err);
      setInmuebles([]);
      setResumen(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const badgeCount = (k) => {
    const r = resumen || {};
    const m = {
      aprobado: r.aprobados || 0,
      pendiente: r.pendientes || 0,
      rechazado: r.rechazados || 0,
      publicados: r.publicados || 0,
      todos: r.todos || (Array.isArray(inmuebles) ? inmuebles.length : 0),
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

  // merge seguro de anuncio
  const patchAnuncio = (prevAnuncio, patch) => ({
    ...(prevAnuncio || {}),
    ...patch,
  });

  const patchInmuebleInList = (id, patch) => {
    setInmuebles((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              ...patch,
              anuncio: patch?.anuncio ? patchAnuncio(x.anuncio, patch.anuncio) : x.anuncio,
            }
          : x
      )
    );
  };

  // Cambiar estado:
  // - Si NO hay anuncio: primero publicarInmueble(sel.id) (crea/activa con "disponible"),
  //   luego, si nuevoEstado !== "disponible", PATCH.
  // - Si hay anuncio: PATCH directo.
  const onCambiarEstado = async (nuevoEstado) => {
    if (!sel) return;
    try {
      setBusy(true);

      let anuncioId = sel?.anuncio?.id ?? null;
      let estadoBase = "disponible";
      let activoBase = true;

      if (!anuncioId) {
        const respPub = await publicarInmueble(sel.id);
        if (!ok(respPub)) {
          const d = pick(respPub);
          throw new Error(d?.message || "No se pudo preparar la publicación.");
        }
        const v = valuesOf(respPub) ?? {};
        anuncioId = v.anuncio_id ?? null;
        estadoBase = v.estado_anuncio ?? "disponible";
        activoBase = Boolean(v.publicado);
      }

      let finalEstado = estadoBase;
      let finalActivo = activoBase;

      if (nuevoEstado && nuevoEstado !== "disponible") {
        const respPatch = await actualizarAnuncio(anuncioId, { estado: nuevoEstado });
        if (!ok(respPatch)) {
          const d = pick(respPatch);
          throw new Error(d?.message || "No se pudo cambiar el estado del anuncio.");
        }
        const vals = valuesOf(respPatch) ?? {};
        finalEstado = vals.estado ?? nuevoEstado;
        finalActivo = typeof vals.is_active === "boolean" ? vals.is_active : activoBase;
      }

      const nextAnuncio = { id: anuncioId, estado: finalEstado, is_active: finalActivo };

      setSel((prev) => ({ ...prev, anuncio: patchAnuncio(prev?.anuncio, nextAnuncio) }));
      patchInmuebleInList(sel.id, { anuncio: nextAnuncio });

      try {
        const resumenRes = await getResumenMisInmuebles();
        setResumen(valuesOf(resumenRes) ?? null);
      } catch {}
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
      if (!ok(resp)) {
        const d = pick(resp);
        throw new Error(d?.message || "No se pudo actualizar activo/inactivo.");
      }

      const vals = valuesOf(resp);
      const nextAnuncio = {
        id: vals?.id ?? sel?.anuncio?.id,
        estado: vals?.estado ?? sel?.anuncio?.estado,
        is_active: typeof vals?.is_active === "boolean" ? vals.is_active : !sel?.anuncio?.is_active,
      };

      setSel((prev) => ({ ...prev, anuncio: patchAnuncio(prev?.anuncio, nextAnuncio) }));

      if (tab === "publicados" && !nextAnuncio.is_active) {
        setInmuebles((prev) => prev.filter((x) => x.id !== sel.id));
      } else {
        patchInmuebleInList(sel.id, { anuncio: nextAnuncio });
      }

      try {
        const resumenRes = await getResumenMisInmuebles();
        setResumen(valuesOf(resumenRes) ?? null);
      } catch {}
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

  // Publicar (crea o reactiva: disponible + activo)
  const onPublicar = async (inmueble) => {
    const item = inmueble || sel;
    if (!item) return;
    try {
      setBusy(true);
      const resp = await publicarInmueble(item.id);
      if (!ok(resp)) {
        const d = pick(resp);
        throw new Error(d?.message || "No se pudo publicar.");
      }
      const v = valuesOf(resp) ?? {};
      const nextAnuncio = {
        id: v.anuncio_id ?? item?.anuncio?.id ?? null,
        estado: v.estado_anuncio ?? "disponible",
        is_active: Boolean(v.publicado),
      };

      if (sel && item.id === sel.id) {
        setSel((prev) => ({ ...prev, anuncio: nextAnuncio }));
      }

      if (tab === "aprobado") {
        // se mueve a 'publicados': sácalo del listado actual
        setInmuebles((prev) => prev.filter((x) => x.id !== item.id));
      } else {
        patchInmuebleInList(item.id, { anuncio: nextAnuncio });
      }

      try {
        const resumenRes = await getResumenMisInmuebles();
        setResumen(valuesOf(resumenRes) ?? null);
      } catch {}
      forceBadgesRefresh();

      setOkMsg("Inmueble publicado/activado.");
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
          onClick={() => navigate("/home/mis-inmuebles/historial")}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          Historial de publicaciones
        </button>
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

        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {inmuebles.map((it) => (
            <div
              key={`${it.id}:${it?.anuncio?.is_active ? "on" : "off"}:${it?.anuncio?.estado || "none"}`}
              className="flex flex-col"
            >
              <InmuebleCard
                  data={it}
                  showBadge
                  refreshKey={refreshKey}
                  onEstadoClick={() => openPanel(it)}
                  onPublicar={() => onPublicar(it)}
                  onOpenDetalle={() => navigate(`/home/propiedades/${it.id}`)}    
                  publishing={busy}
                  showPublishInCard={tab === "aprobado"} 
                
              />
              {/* 🔥 Se elimina el botón "Estado" que estaba debajo del card */}
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
                <h3 className="text-sm font-bold">Modificar Estado</h3>
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

              <div className="mt-4 text-xs text-neutral-600">Cambiar estado</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { k: "disponible", label: "Disponible" },
                  { k: "vendido", label: "Vendido" },
                  { k: "alquilado", label: "Alquilado" },
                  { k: "anticretico", label: "Anticrético" },
                ].map((btn) => {
                  const active = String(sel?.anuncio?.estado || "") === btn.k;
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
