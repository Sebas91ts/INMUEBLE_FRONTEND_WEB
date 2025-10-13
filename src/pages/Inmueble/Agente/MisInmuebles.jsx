// src/pages/Inmueble/Agente/MisInmuebles.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, X, Clock, TrendingUp, CheckCircle, AlertCircle, XCircle, LayoutGrid, List } from "lucide-react";

import { getMisInmuebles, getResumenMisInmuebles } from "../../../api/inmueble";
import { actualizarAnuncio, publicarInmueble } from "../../../api/inmueble/anuncios";

import InmuebleCard from "../../Inmuebles/components/InmuebleCard";
import ApprovalModal from "../../../components/AprovalModal";

const TABS = [
  { key: "aprobado", label: "Aprobados", icon: CheckCircle, color: "green" },
  { key: "pendiente", label: "Pendientes", icon: Clock, color: "yellow" },
  { key: "rechazado", label: "Rechazados", icon: XCircle, color: "red" },
  { key: "publicados", label: "Publicados", icon: TrendingUp, color: "blue" },
  { key: "todos", label: "Todos", icon: LayoutGrid, color: "gray" },
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

      setOkMsg("Estado del anuncio actualizado correctamente.");
      setOkOpen(true);
    } catch (e) {
      console.error("❌ Cambiar estado:", e);
      alert(e?.message || "No se pudo cambiar el estado.");
    } finally {
      setBusy(false);
    }
  };

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

      setOkMsg(nextAnuncio.is_active ? "Anuncio activado correctamente." : "Anuncio desactivado correctamente.");
      setOkOpen(true);
    } catch (e) {
      console.error("❌ Toggle activo:", e);
      alert(e?.message || "No se pudo actualizar el anuncio.");
    } finally {
      setBusy(false);
    }
  };

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
        setInmuebles((prev) => prev.filter((x) => x.id !== item.id));
      } else {
        patchInmuebleInList(item.id, { anuncio: nextAnuncio });
      }

      try {
        const resumenRes = await getResumenMisInmuebles();
        setResumen(valuesOf(resumenRes) ?? null);
      } catch {}
      forceBadgesRefresh();

      setOkMsg("¡Inmueble publicado con éxito!");
      setOkOpen(true);
    } catch (e) {
      console.error("❌ Publicar:", e);
      alert(e?.message || "No se pudo publicar.");
    } finally {
      setBusy(false);
    }
  };

  const goCrear = () => navigate("/home/inmuebles/crear");

  const currentTab = TABS.find(t => t.key === tab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Premium */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <LayoutGrid className="w-6 h-6 text-white" />
                </div>
                Mis Inmuebles
              </h1>
              <p className="text-gray-600 text-sm">Gestiona tus propiedades y anuncios publicados</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => navigate("/home/mis-inmuebles/historial")}
                className="inline-flex items-center justify-center gap-2.5 border-2 border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-6 py-3 rounded-xl transition-all font-medium group shadow-sm hover:shadow"
              >
                <Clock className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span>Historial</span>
              </button>
              
              <button
                onClick={goCrear}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 text-white transition-all font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:scale-105 active:scale-95"
              >
                <Plus className="h-5 w-5" />
                <span>Crear Inmueble</span>
              </button>
            </div>
          </div>


        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span>{t.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                  }`}>
                    {badgeCount(t.key)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-blue-100"></div>
              </div>
              <p className="text-gray-600 font-medium">Cargando inmuebles...</p>
            </div>
          </div>
        ) : inmuebles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                {currentTab && <currentTab.icon className="w-10 h-10 text-gray-400" />}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay inmuebles en esta categoría
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {tab === "aprobado" 
                    ? "Los inmuebles aprobados aparecerán aquí listos para publicar."
                    : tab === "pendiente"
                    ? "Tus inmuebles en revisión se mostrarán aquí."
                    : tab === "publicados"
                    ? "Los inmuebles publicados aparecerán en esta sección."
                    : "Aún no tienes inmuebles en esta categoría."}
                </p>
              </div>
              {tab === "todos" && (
                <button
                  onClick={goCrear}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:scale-105 transition-all mt-4"
                >
                  <Plus className="w-5 h-5" />
                  Crear tu primer inmueble
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inmuebles.map((it) => (
              <div
                key={`${it.id}:${it?.anuncio?.is_active ? "on" : "off"}:${it?.anuncio?.estado || "none"}`}
                className="transform transition-all duration-200 hover:scale-[1.02]"
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel lateral mejorado */}
      {panelOpen && sel && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
            onClick={closePanel} 
          />
          <aside className="fixed right-0 top-0 h-full w-full sm:w-[480px] z-50 animate-in slide-in-from-right duration-300">
            <div className="h-full bg-white shadow-2xl flex flex-col">
              {/* Header del panel */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold">Gestionar Anuncio</h3>
                  <button 
                    onClick={closePanel} 
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors" 
                    title="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="font-semibold text-lg">{sel?.titulo || "Sin título"}</div>
                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <span>{sel?.ciudad || "—"}</span>
                    <span>•</span>
                    <span className="font-semibold">Bs {Number(sel?.precio || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Body del panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Estado actual */}
                {sel?.anuncio?.estado && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Estado actual</span>
                    </div>
                    <p className="text-xl font-bold text-blue-900 capitalize">{sel.anuncio.estado}</p>
                  </div>
                )}

                {/* Cambiar estado */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Cambiar estado del anuncio
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: "disponible", label: "Disponible", color: "green" },
                      { k: "vendido", label: "Vendido", color: "blue" },
                      { k: "alquilado", label: "Alquilado", color: "purple" },
                      { k: "anticretico", label: "Anticrético", color: "orange" },
                    ].map((btn) => {
                      const active = String(sel?.anuncio?.estado || "") === btn.k;
                      const colors = {
                        green: active ? "bg-green-600 text-white shadow-lg shadow-green-600/30" : "border-green-300 text-green-700 hover:bg-green-50",
                        blue: active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "border-blue-300 text-blue-700 hover:bg-blue-50",
                        purple: active ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "border-purple-300 text-purple-700 hover:bg-purple-50",
                        orange: active ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30" : "border-orange-300 text-orange-700 hover:bg-orange-50",
                      };
                      return (
                        <button
                          key={btn.k}
                          onClick={() => !active && !busy && onCambiarEstado(btn.k)}
                          disabled={active || busy}
                          className={`h-12 rounded-xl text-sm font-medium border-2 transition-all ${
                            colors[btn.color]
                          } ${active ? "cursor-default" : ""} ${busy ? "opacity-50" : ""}`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Activar/Desactivar */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Visibilidad del anuncio
                  </label>
                  <button
                    onClick={onToggleActivo}
                    disabled={busy || !sel?.anuncio?.id}
                    className={`w-full h-12 rounded-xl text-sm font-semibold border-2 transition-all ${
                      sel?.anuncio?.is_active
                        ? "border-red-500 bg-red-50 text-red-700 hover:bg-red-100 shadow-sm"
                        : "border-green-500 bg-green-50 text-green-700 hover:bg-green-100 shadow-sm"
                    } ${!sel?.anuncio?.id ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                    title={!sel?.anuncio?.id ? "Primero define el estado del anuncio" : ""}
                  >
                    {busy ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Procesando...
                      </span>
                    ) : sel?.anuncio?.is_active ? (
                      <span className="inline-flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Desactivar anuncio
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Activar anuncio
                      </span>
                    )}
                  </button>
                </div>

                {/* Info adicional */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <p className="font-medium text-gray-700 mb-1">Información importante:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Los cambios se aplican inmediatamente</li>
                        <li>El anuncio debe estar activo para ser visible</li>
                        <li>Puedes cambiar el estado en cualquier momento</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* FAB mejorado */}
      <button
        onClick={() => navigate("/home/mis-inmuebles/crear")}
        className="fixed bottom-8 right-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white shadow-2xl shadow-blue-600/50 hover:shadow-blue-600/60 hover:scale-110 active:scale-95 transition-all duration-200 z-30 group"
        aria-label="Crear inmueble"
        title="Crear inmueble"
      >
        <Plus className="h-7 w-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <ApprovalModal
        isOpen={okOpen}
        onClose={() => setOkOpen(false)}
        message={okMsg || "Operación realizada correctamente."}
      />
    </div>
  );
}