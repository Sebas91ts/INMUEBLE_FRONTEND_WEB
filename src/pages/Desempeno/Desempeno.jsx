// src/pages/Desempeno/Desempeno.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar, ResponsiveContainer
} from "recharts";
import { Download, Printer, RefreshCw, AlertCircle, Sparkles, Copy, Lock } from "lucide-react";
import { getDesempenoAgente, postReporteIAGemini } from "../../api/desempeno/desempeno";

// 1. IMPORTAR EL MODAL SAAS
// Asegúrate de que la ruta sea correcta según tu estructura de carpetas
import SaaSModal from "../../components/SaaSModal";

/**
 * Util: convierte el payload de la API a un CSV descargable.
 */
function exportCSV(report) {
  try {
    const lines = [];
    lines.push(["agente_id", report.agente_id].join(","));

    // Totales
    lines.push("\n#Totales");
    lines.push("métrica,valor");
    Object.entries(report.totales || {}).forEach(([k, v]) => {
      lines.push(`${k},${v}`);
    });

    // Estados
    lines.push("\n#Estados");
    lines.push("estado,count,pct");
    Object.entries(report.estados || {}).forEach(([estado, obj]) => {
      lines.push(`${estado},${obj?.count ?? 0},${obj?.pct ?? 0}`);
    });

    // KPIs
    lines.push("\n#KPIs");
    lines.push("kpi,valor");
    Object.entries(report.kpis || {}).forEach(([k, v]) => {
      lines.push(`${k},${v}`);
    });

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().split("T")[0];
    a.download = `desempeno_agente_${report.agente_id}_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Error exportando CSV", e);
    alert("No se pudo exportar el CSV");
  }
}

/**
 * Util: imprime sólo la sección del reporte
 */
function printElement(node) {
  if (!node) return;
  const w = window.open("", "PRINT", "height=800,width=1000");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>Reporte de desempeño</title>
    <style>
      body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";padding:24px;color:#0c0a09}
      h1,h2{margin:0 0 12px}
      .grid{display:grid;gap:16px}
      .cards{grid-template-columns:repeat(3,minmax(0,1fr))}
      .card{border:1px solid #e7e5e4;border-radius:14px;padding:16px}
      pre{white-space:pre-wrap; word-break:break-word}
      .muted{color:#57534e}
    </style>
  </head><body>`);
  w.document.write(node.innerHTML);
  w.document.write("</body></html>");
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

const COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#a78bfa", "#ef4444", "#14b8a6"];

export default function Desempeno() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState(null);
  const [iaText, setIaText] = useState("");

  // 2. ESTADOS PARA EL MODAL SAAS
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const reportRef = useRef(null);

  const auth = useMemo(() => JSON.parse(localStorage.getItem("authData") || "{}"), []);
  const agenteId = auth?.user?.id; 

  const fetchData = async () => {
    if (!agenteId) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await getDesempenoAgente(agenteId);
      setData(res.data);
    } catch (e) {
      console.error(e);
      
      // 3. INTERCEPCIÓN DEL ERROR 403 (Plan insuficiente)
      if (e.response && e.response.status === 403) {
        const msg = e.response.data?.detail || e.response.data?.message || "Esta función requiere un plan superior.";
        setUpgradeMessage(msg);
        setShowUpgradeModal(true); // Activa el modal
        setErr("Acceso restringido por nivel de suscripción."); // Mensaje para la UI de fondo
      } else {
        setErr(e?.response?.data?.message || "No se pudo cargar el reporte");
      }
    } finally {
      setLoading(false);
    }
  };

  const buildIAPayload = (report) => {
    const tot = report?.totales || {};
    const est = report?.estados || {};
    const kpis = report?.kpis || {};

    const estadoCounts = Object.entries(est).reduce((acc, [k, v]) => {
      acc[k] = v?.count ?? 0;
      return acc;
    }, {});

    return {
      kpis: {
        publicaciones: Number(tot.publicaciones ?? 0),
        publicaciones_con_anuncio: Number(tot.publicaciones_con_anuncio ?? 0),
        anuncios: Number(tot.anuncios ?? 0),
        ...estadoCounts,
        desempeno: Number(kpis.desempeno ?? 0),
        tasa_publicacion: Number(kpis.tasa_publicacion ?? 0)
      },
      notas: `Agente ${report?.agente_id ?? ""} • Datos auto-generados desde el dashboard.`
    };
  };

  const pedirReporteIA = async () => {
    if (!data) return;
    
    // VALIDACIÓN ADICIONAL PARA IA (Opcional: si el botón está visible pero el backend bloquea)
    setIaLoading(true);
    setIaError(null);
    setIaText("");
    try {
      const payload = buildIAPayload(data);
      const res = await postReporteIAGemini(payload);

      const texto =
        res?.data?.reporte ||
        res?.data?.reporte_ia ||
        res?.data?.values?.reporte ||
        res?.data?.values?.reporte_ia ||
        res?.data?.text ||
        "";

      if (!texto) {
        setIaError("La API no devolvió texto. Revisa el backend.");
      } else {
        setIaText(String(texto));
      }
    } catch (e) {
      console.error(e);
      // Intercepción SaaS también aquí para la IA
      if (e.response && e.response.status === 403) {
          setUpgradeMessage("La generación de reportes con IA es exclusiva de planes avanzados.");
          setShowUpgradeModal(true);
          setIaError("Función Premium Bloqueada");
      } else {
          const apiMsg =
            e?.response?.data?.detail ||
            e?.response?.data?.message ||
            e?.message ||
            "Error al solicitar el reporte de IA";
          setIaError(apiMsg);
      }
    } finally {
      setIaLoading(false);
    }
  };

  const copyIA = async () => {
    try {
      await navigator.clipboard.writeText(iaText || "");
    } catch (e) {
      console.error("No se pudo copiar", e);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agenteId]);

  if (!agenteId) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5" />
          <span>Sin id de agente en la sesión.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 relative">
      
      {/* 4. RENDERIZAR COMPONENTE DEL MODAL SAAS */}
      <SaaSModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        title="Módulo Premium"
        message={upgradeMessage}
        actionLabel="Ver Planes y Precios"
      />

      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Desempeño del agente #{agenteId}</h1>
          <p className="text-stone-600 text-sm">Resumen de publicaciones, estados y KPIs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
          <button
            disabled={!data}
            onClick={() => exportCSV(data)}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 text-white px-3 py-2 text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button
            disabled={!data}
            onClick={() => printElement(reportRef.current)}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          {/* Botón IA */}
          <button
            disabled={!data || iaLoading}
            onClick={pedirReporteIA}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
            title="Generar insights con IA (Gemini)"
          >
            <Sparkles className="w-4 h-4" />
            {iaLoading ? "Generando…" : "Reporte IA"}
          </button>
        </div>
      </div>

      {/* Estados de carga */}
      {loading && <div className="text-stone-600">Cargando métricas...</div>}
      
      {/* ESTADO DE ERROR / SAAS BLOQUEADO */}
      {err && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50">
             <div className="p-4 bg-stone-100 rounded-full mb-4">
                {err.includes("Acceso restringido") ? <Lock className="w-8 h-8 text-orange-500" /> : <AlertCircle className="w-8 h-8 text-red-500" />}
             </div>
             <h3 className="text-lg font-semibold text-stone-900">No se pudo cargar el reporte</h3>
             <p className="text-stone-500 mt-1 px-4 text-center">{err}</p>
             {err.includes("Acceso restringido") && (
                <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
                >
                    Ver opciones de mejora
                </button>
             )}
        </div>
      )}

      {/* Contenido del reporte (Solo si data existe) */}
      {data && (
        <div ref={reportRef} className="space-y-6">
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Desempeño" value={`${data.kpis?.desempeno ?? 0}%`} subtitle={data.kpis?.nota || "-"} />
            <KpiCard title="Tasa de publicación" value={`${data.kpis?.tasa_publicacion ?? 0}%`} subtitle="Publicaciones con anuncio" />
            <KpiCard title="Publicaciones" value={data.totales?.publicaciones ?? 0} subtitle="Total creadas" />
            <KpiCard title="Anuncios" value={data.totales?.anuncios ?? 0} subtitle="Activos / total" />
          </div>

          {/* Radial - Desempeño */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card border rounded-2xl p-4">
              <h2 className="font-semibold text-stone-900 mb-2">Índice de desempeño</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="60%"
                    outerRadius="100%"
                    data={[{ name: "desempeño", value: data.kpis?.desempeno ?? 0 }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar minAngle={15} background clockWise dataKey="value" fill="#0ea5e9" cornerRadius={10} />
                    <Tooltip formatter={(v) => `${v}%`} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-stone-600 text-sm">{data.kpis?.nota || "-"}</p>
            </div>

            {/* Pie - Estados */}
            <div className="card border rounded-2xl p-4">
              <h2 className="font-semibold text-stone-900 mb-2">Distribución por estado</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={Object.entries(data.estados || {}).map(([k, v]) => ({ name: k, value: v?.count ?? 0 }))}
                      cx="50%" cy="50%" outerRadius={100}
                      label={(d) => (d.value > 0 ? `${d.name} (${d.value})` : null)}
                    >
                      {Object.keys(data.estados || {}).map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Barras - Totales */}
            <div className="card border rounded-2xl p-4">
              <h2 className="font-semibold text-stone-900 mb-2">Totales</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[{
                      name: "Totales",
                      publicaciones: data.totales?.publicaciones ?? 0,
                      con_anuncio: data.totales?.publicaciones_con_anuncio ?? 0,
                      anuncios: data.totales?.anuncios ?? 0
                    }]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="publicaciones" fill={COLORS[0]} />
                    <Bar dataKey="con_anuncio" fill={COLORS[2]} />
                    <Bar dataKey="anuncios" fill={COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tarjeta: Reporte IA */}
          <div className="border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-stone-900">Reporte IA</h2>
              <div className="flex gap-2">
                <button
                  onClick={pedirReporteIA}
                  disabled={iaLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 px-3 py-2 text-sm font-medium hover:bg-indigo-50 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {iaLoading ? "Generando…" : "Volver a generar"}
                </button>
                <button
                  onClick={copyIA}
                  disabled={!iaText}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50 disabled:opacity-50"
                >
                  <Copy className="w-4 h-4" /> Copiar
                </button>
              </div>
            </div>

            {iaError && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>{iaError}</span>
              </div>
            )}

            <div className="bg-stone-50 rounded-xl p-3 text-sm whitespace-pre-wrap">
              {iaText ? iaText : <span className="text-stone-500">Aún no hay reporte. Haz clic en “Reporte IA”.</span>}
            </div>
          </div>

          {/* Tabla: Estados */}
          <div className="border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-600">
                <tr>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-right px-4 py-3">Cantidad</th>
                  <th className="text-right px-4 py-3">%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.estados || {}).map(([estado, v], idx) => (
                  <tr key={estado} className="border-t">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="capitalize">{estado}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{v?.count ?? 0}</td>
                    <td className="px-4 py-3 text-right">{(v?.pct ?? 0).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* JSON crudo opcional */}
          <details className="border rounded-2xl p-4 text-sm text-stone-700">
            <summary className="cursor-pointer font-medium">Ver JSON completo</summary>
            <pre className="mt-3 bg-stone-50 p-3 rounded-xl overflow-auto">{JSON.stringify(data, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, subtitle }) {
  return (
    <div className="border rounded-2xl p-4">
      <div className="text-stone-600 text-sm">{title}</div>
      <div className="text-2xl font-semibold text-stone-900">{value}</div>
      {subtitle && <div className="text-stone-500 text-xs mt-1">{subtitle}</div>}
    </div>
  );
}