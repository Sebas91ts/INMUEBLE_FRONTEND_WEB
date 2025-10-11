// src/pages/Inmueble/Agente/MisInmuebles.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";

import {
  getMisInmuebles,
  getResumenMisInmuebles,
  publicarInmueble,
} from "../../../api/inmueble";

import PropertyCard from "../../../components/PropertyCard";
// Tu archivo se llama AprovalModal.jsx
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
  const [publicando, setPublicando] = useState(null);
  const [okOpen, setOkOpen] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  const puedePublicar = useMemo(() => tab === "aprobado", [tab]);

  const loadData = async (estado) => {
    setLoading(true);
    try {
      const [listaRes, resumenRes] = await Promise.all([
        getMisInmuebles(estado),
        getResumenMisInmuebles(),
      ]);
      const items = listaRes?.data?.values?.inmuebles ?? [];
      setInmuebles(items);
      setResumen(resumenRes?.data?.values ?? null);
    } catch (err) {
      console.error("❌ Error cargando mis inmuebles:", err);
      setInmuebles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(tab);
  }, [tab]);

  const handlePublicar = async (id) => {
    try {
      setPublicando(id);
      const { status, error, message } = await publicarInmueble(id);
      if (status === 1 && !error) {
        setInmuebles((prev) => prev.filter((i) => i.id !== id));
        const resumenRes = await getResumenMisInmuebles();
        setResumen(resumenRes?.data?.values ?? null);
        setOkMsg(message || "Inmueble publicado correctamente.");
        setOkOpen(true);
      } else {
        alert("⚠️ " + (message || "No se pudo publicar el inmueble."));
      }
    } catch (err) {
      console.error("❌ Publicar:", err);
      alert("❌ Error al intentar publicar el inmueble.");
    } finally {
      setPublicando(null);
    }
  };

  const badge = (k) => {
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
            <span className="ml-2 text-xs font-semibold">{badge(t.key)}</span>
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
            <PropertyCard
              key={it.id}
              image={it.fotos?.[0]?.url}
              title={it.titulo}
              location={it.ciudad}
              price={it.precio}
              beds={it.dormitorios}
              baths={it["baños"] ?? it.banos}
              area={it.superficie}
              to={`/propiedades/${it.id}`}
              actionLabel={puedePublicar ? "Publicar" : undefined}
              onAction={puedePublicar ? () => handlePublicar(it.id) : undefined}
              actionDisabled={publicando === it.id}
            />
          ))}
        </div>
      )}

      <button
        onClick={goCrear}
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








