// src/pages/Desempeno/Desempeno.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar, ResponsiveContainer
} from "recharts";
import { Download, Printer, RefreshCw, AlertCircle, Sparkles, Copy, XCircle } from "lucide-react";
import { getDesempenoAgente, postReporteIAGemini } from "../../api/desempeno/desempeno";

// =========================== CONFIGURACIÓN ===============================
// 📅 Fecha desde la cual tu sistema empezó a registrar datos reales.
// Úsala para estimar proporcionalmente cuando el usuario filtra por fechas.
// AJÚSTALA a tu proyecto (si no, las estimaciones no reflejarán la realidad).
const FECHA_INICIO_HISTORICA = new Date("2025-10-01");

// =========================== HELPERS =====================================
const COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#a78bfa", "#ef4444", "#14b8a6"];

const pct = (n) => `${Number(n || 0).toFixed(2)}%`;
const int = (n) => new Intl.NumberFormat("es-BO").format(Number(n || 0));

/**
 * Simula datos del período seleccionado escalando los totales históricos.
 * - Supone flujo constante desde FECHA_INICIO_HISTORICA hasta hoy.
 * - Útil cuando el backend aún no expone filtros por fecha.
 */
function simularDatosPorPeriodo(datosTotales, filtros) {
  if (!datosTotales || !datosTotales.totales) return null;

  const hoy = new Date();
  const inicioHistorico = FECHA_INICIO_HISTORICA;

  const duracionTotalMs = hoy.getTime() - inicioHistorico.getTime();
  if (duracionTotalMs <= 0) return datosTotales; // safety

  const fechaInicioFiltro = filtros.fecha_inicio ? new Date(filtros.fecha_inicio) : inicioHistorico;
  const fechaFinFiltro = filtros.fecha_fin ? new Date(filtros.fecha_fin) : hoy;
  fechaFinFiltro.setHours(23, 59, 59, 999);

  const duracionSelMs = Math.max(0, fechaFinFiltro.getTime() - fechaInicioFiltro.getTime());
  const proporcion = Math.min(1, duracionSelMs / duracionTotalMs);

  const estimar = (valor) => Math.round((valor || 0) * proporcion);

  // Totales
  const totalesSim = {
    publicaciones: estimar(datosTotales.totales.publicaciones),
    publicaciones_con_anuncio: estimar(datosTotales.totales.publicaciones_con_anuncio),
    anuncios: estimar(datosTotales.totales.anuncios),
  };

  // Estados
  const estadosSim = {};
  Object.entries(datosTotales.estados || {}).forEach(([key, value]) => {
    estadosSim[key] = { count: estimar(value.count) };
  });

  const totalAnuncios = totalesSim.anuncios;
  Object.entries(estadosSim).forEach(([_, v]) => {
    v.pct = totalAnuncios > 0 ? parseFloat(((v.count * 100) / totalAnuncios).toFixed(2)) : 0;
  });

  // KPIs
  const cerrados =
    (estadosSim.vendido?.count || 0) +
    (estadosSim.anticretico?.count || 0) +
    (estadosSim.alquilado?.count || 0);

  const kpiDesempeno = totalAnuncios > 0 ? parseFloat(((cerrados * 100) / totalAnuncios).toFixed(2)) : 0;
  const kpiTasaPub =
    totalesSim.publicaciones > 0
      ? parseFloat(((totalesSim.publicaciones_con_anuncio * 100) / totalesSim.publicaciones).toFixed(2))
      : 0;

  const etiqueta = (p) => (p >= 75 ? "Excelente" : p >= 50 ? "Bueno" : p >= 25 ? "Regular" : "Bajo");

  const kpisSim = {
    desempeno: kpiDesempeno,
    tasa_publicacion: kpiTasaPub,
    nota: etiqueta(kpiDesempeno),
  };

  return { ...datosTotales, totales: totalesSim, estados: estadosSim, kpis: kpisSim };
}

function exportCSV(report) {
  if (!report) return;
  try {
    const lines = [];
    lines.push(["agente_id", report.agente_id].join(","));
    lines.push("\n#Totales");
    lines.push("métrica,valor");
    Object.entries(report.totales || {}).forEach(([k, v]) => lines.push(`${k},${v}`));
    lines.push("\n#Estados");
    lines.push("estado,count,pct");
    Object.entries(report.estados || {}).forEach(([estado, obj]) => lines.push(`${estado},${obj?.count ?? 0},${obj?.pct ?? 0}`));
    lines.push("\n#KPIs");
    lines.push("kpi,valor");
    Object.entries(report.kpis || {}).forEach(([k, v]) => lines.push(`${k},${v}`));
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().split("T")[0];
    a.download = `desempeno_agente_${report.agente_id || "s/n"}_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Error exportando CSV", e);
    alert("No se pudo exportar el CSV");
  }
}

function printElement(node) {
  if (!node) return;
  const w = window.open("", "PRINT", "height=800,width=1000");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>Reporte de desempeño</title>
    <style>
      body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";padding:24px;color:#0c0a09}
      h1,h2{margin:0 0 12px}
      .card{border:1px solid #e7e5e4;border-radius:14px;padding:16px}
      table{width:100%;text-align:left;border-collapse:collapse;}
      thead{background-color:#f5f5f4}
      th,td{padding:12px 16px;border-top:1px solid #e7e5e4}
    </style>
  </head><body>`);
  w.document.write(node.innerHTML);
  w.document.write("</body></html>");
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

// =========================== COMPONENTE ==================================
export default function Desempeno() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [datosHistoricos, setDatosHistoricos] = useState(null);
  const [filtros, setFiltros] = useState({ fecha_inicio: "", fecha_fin: "" });
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState(null);
  const [iaText, setIaText] = useState("");
  const reportRef = useRef(null);

  const auth = useMemo(() => JSON.parse(localStorage.getItem("authData") || "{}"), []);
  const agenteId = auth?.user?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (!agenteId) {
        setErr("No encontramos el ID del agente en la sesión.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const res = await getDesempenoAgente(agenteId);
        setDatosHistoricos(res.data);
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.message || "No se pudo cargar el reporte.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agenteId]);

  const datosMostrados = useMemo(() => simularDatosPorPeriodo(datosHistoricos, filtros), [datosHistoricos, filtros]);

  const buildIAPayload = (report) => {
    if (!report) return {};
    const tot = report.totales || {};
    const est = report.estados || {};
    const kpis = report.kpis || {};
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
        tasa_publicacion: Number(kpis.tasa_publicacion ?? 0),
      },
      notas: `Agente ${report.agente_id ?? ""} • Datos estimados según período seleccionado.`,
    };
  };

  const pedirReporteIA = async () => {
    if (!datosMostrados) return;
    setIaLoading(true);
    setIaError(null);
    setIaText("");
    try {
      const payload = buildIAPayload(datosMostrados);
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
      const apiMsg = e?.response?.data?.detail || e?.response?.data?.message || e?.message || "Error al solicitar el reporte de IA";
      setIaError(apiMsg);
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

  const limpiarFiltros = () => setFiltros({ fecha_inicio: "", fecha_fin: "" });

  // =========================== UI STATES ==================================
  if (loading) return <div className="p-6 text-center text-stone-600">Cargando datos de desempeño…</div>;

  if (err) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5" />
          <span>{err}</span>
        </div>
      </div>
    );
  }

  if (!datosMostrados) {
    return <div className="p-6 text-center text-stone-600">No hay datos de desempeño para mostrar.</div>;
  }

  const hayFiltro =
    (filtros.fecha_inicio && filtros.fecha_inicio.trim() !== "") ||
    (filtros.fecha_fin && filtros.fecha_fin.trim() !== "");

  // =========================== RENDER =====================================
  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Desempeño del agente #{agenteId}</h1>
          <p className="text-stone-600 text-sm">Tu panel de resultados: publicaciones, estados y métricas clave.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50"
            title="Recarga los datos del servidor"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
          <button
            disabled={!datosMostrados}
            onClick={() => exportCSV(datosMostrados)}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 text-white px-3 py-2 text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
            title="Descarga los datos visibles en CSV"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button
            disabled={!datosMostrados}
            onClick={() => printElement(reportRef.current)}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50 disabled:opacity-50"
            title="Imprime este panel"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button
            disabled={!datosMostrados || iaLoading}
            onClick={pedirReporteIA}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
            title="Generar insights automáticos (Gemini)"
          >
            <Sparkles className="w-4 h-4" />
            {iaLoading ? "Generando…" : "Reporte IA"}
          </button>
        </div>
      </div>

      {/* Filtros por fecha */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 border rounded-2xl bg-stone-50">
        <div>
          <label htmlFor="fecha_inicio" className="block text-sm font-medium text-stone-700 mb-1">
            Fecha de inicio
          </label>
          <input
            type="date"
            id="fecha_inicio"
            value={filtros.fecha_inicio}
            onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
            className="w-full rounded-xl border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div>
          <label htmlFor="fecha_fin" className="block text-sm font-medium text-stone-700 mb-1">
            Fecha de fin
          </label>
          <input
            type="date"
            id="fecha_fin"
            value={filtros.fecha_fin}
            onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
            className="w-full rounded-xl border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          />
        </div>
        <button
          onClick={limpiarFiltros}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100"
          title="Quita el período seleccionado"
        >
          <XCircle className="w-4 h-4" /> Limpiar
        </button>
      </div>

      {/* Aviso de estimación cuando hay filtro */}
      {hayFiltro && (
        <div className="flex items-center gap-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4" />
          <span>
            Estás viendo <strong>estimaciones</strong> para el período seleccionado. Cuando el backend exponga filtros por fecha,
            estos números serán exactos.
          </span>
        </div>
      )}

      {/* Guía rápida */}
      <details className="border rounded-2xl p-4 text-sm text-stone-700">
        <summary className="cursor-pointer font-medium">¿Cómo leer este panel?</summary>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li><strong>Desempeño:</strong> porcentaje de anuncios que terminaron en <em>vendido, anticrético o alquilado</em> sobre el total de anuncios.</li>
          <li><strong>Tasa de publicación:</strong> de todas tus publicaciones, ¿en cuántas agregaste un anuncio? (mide tu constancia).</li>
          <li><strong>Distribución por estado:</strong> cuántos anuncios tienes en cada estado (y su peso relativo).</li>
          <li><strong>Totales:</strong> conteo simple de publicaciones, publicaciones con anuncio y anuncios.</li>
        </ul>
      </details>

      {/* Contenido imprimible */}
      <div ref={reportRef} className="space-y-6">
        {/* KPIs principales con explicación */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Desempeño"
            value={pct(datosMostrados.kpis?.desempeno)}
            subtitle={`Resultado: ${datosMostrados.kpis?.nota || "-"}. Fórmula: cerrados / anuncios.`}
          />
          <KpiCard
            title="Tasa de publicación"
            value={pct(datosMostrados.kpis?.tasa_publicacion)}
            subtitle="Fórmula: publicaciones con anuncio / publicaciones."
          />
          <KpiCard title="Publicaciones" value={int(datosMostrados.totales?.publicaciones)} subtitle="Total (estimado en período)" />
          <KpiCard title="Anuncios" value={int(datosMostrados.totales?.anuncios)} subtitle="Total (estimado en período)" />
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Desempeño radial */}
          <div className="card border rounded-2xl p-4">
            <h2 className="font-semibold text-stone-900 mb-2">Índice de desempeño</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={[{ name: "desempeño", value: datosMostrados.kpis?.desempeno ?? 0 }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar minAngle={15} background clockWise dataKey="value" fill="#0ea5e9" cornerRadius={10} />
                  <Tooltip formatter={(v) => `${v}%`} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-stone-600 text-sm">{datosMostrados.kpis?.nota || "-"}</p>
          </div>

          {/* Estados */}
          <div className="card border rounded-2xl p-4">
            <h2 className="font-semibold text-stone-900 mb-2">Distribución por estado</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={Object.entries(datosMostrados.estados || {}).map(([k, v]) => ({
                      name: k,
                      value: v?.count ?? 0,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(d) => (d.value > 0 ? `${d.name} (${int(d.value)})` : null)}
                  >
                    {Object.keys(datosMostrados.estados || {}).map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Totales */}
          <div className="card border rounded-2xl p-4">
            <h2 className="font-semibold text-stone-900 mb-2">Totales</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Totales",
                      publicaciones: datosMostrados.totales?.publicaciones ?? 0,
                      con_anuncio: datosMostrados.totales?.publicaciones_con_anuncio ?? 0,
                      anuncios: datosMostrados.totales?.anuncios ?? 0,
                    },
                  ]}
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

        {/* Tabla de estados */}
        <div className="border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Cantidad</th>
                <th className="text-right px-4 py-3">Peso %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(datosMostrados.estados || {}).map(([estado, v], idx) => (
                <tr key={estado} className="border-t">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="capitalize">{estado}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{int(v?.count)}</td>
                  <td className="px-4 py-3 text-right">{pct(v?.pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reporte IA */}
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

        {/* JSON para debug */}
        <details className="border rounded-2xl p-4 text-sm text-stone-700">
          <summary className="cursor-pointer font-medium">Ver JSON completo (estimado)</summary>
          <pre className="mt-3 bg-stone-50 p-3 rounded-xl overflow-auto">{JSON.stringify(datosMostrados, null, 2)}</pre>
        </details>
      </div>
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
