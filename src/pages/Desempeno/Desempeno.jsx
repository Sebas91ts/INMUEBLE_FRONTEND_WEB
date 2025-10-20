// src/pages/Desempeno/Desempeno.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar, ResponsiveContainer
} from "recharts";
import { Download, Printer, RefreshCw, AlertCircle, Sparkles, Copy, XCircle, Info } from "lucide-react";
import { getDesempenoAgente, postReporteIAGemini } from "../../api/desempeno/desempeno";

// ====================================================================================
// 🎩 --- CONFIGURACIÓN DE LA SIMULACIÓN --- 🎩
// ====================================================================================
// Define la fecha desde la cual se empezaron a registrar datos en tu sistema.
// ¡DEBES AJUSTAR ESTA FECHA A LA REALIDAD DE TU PROYECTO PARA UNA SIMULACIÓN PRECISA!
const FECHA_INICIO_HISTORICA = new Date("2025-10-01");
// ====================================================================================


// --- Funciones de Ayuda (Fuera del componente) ---

/**
 * Simula los datos de desempeño para un período específico basándose en los totales históricos.
 * Asume una distribución uniforme de la actividad a lo largo del tiempo.
 */
function simularDatosPorPeriodo(datosTotales, filtros) {
  if (!datosTotales || !datosTotales.totales) return null;

  const hoy = new Date();
  const inicioHistorico = FECHA_INICIO_HISTORICA;

  const duracionTotalMs = hoy.getTime() - inicioHistorico.getTime();
  if (duracionTotalMs <= 0) return datosTotales;

  const fechaInicioFiltro = filtros.fecha_inicio ? new Date(filtros.fecha_inicio) : inicioHistorico;
  const fechaFinFiltro = filtros.fecha_fin ? new Date(filtros.fecha_fin) : hoy;
  fechaFinFiltro.setHours(23, 59, 59, 999);

  const duracionSeleccionadaMs = Math.max(0, fechaFinFiltro.getTime() - fechaInicioFiltro.getTime());
  const proporcion = Math.min(1, duracionSeleccionadaMs / duracionTotalMs);
  const estimar = (valor) => Math.round((valor || 0) * proporcion);

  const totalesSimulados = {
    publicaciones: estimar(datosTotales.totales.publicaciones),
    publicaciones_con_anuncio: estimar(datosTotales.totales.publicaciones_con_anuncio),
    anuncios: estimar(datosTotales.totales.anuncios),
  };
  
  const estadosSimulados = {};
  Object.entries(datosTotales.estados || {}).forEach(([key, value]) => {
    estadosSimulados[key] = { count: estimar(value.count) };
  });

  const totalAnunciosSimulados = totalesSimulados.anuncios;
  Object.entries(estadosSimulados).forEach(([key, value]) => {
    value.pct = totalAnunciosSimulados > 0 ? parseFloat(((value.count * 100) / totalAnunciosSimulados).toFixed(2)) : 0;
  });

  const cerradosSimulados = (estadosSimulados.vendido?.count || 0) + (estadosSimulados.anticretico?.count || 0) + (estadosSimulados.alquilado?.count || 0);
  const desempenoSimulado = totalAnunciosSimulados > 0 ? parseFloat(((cerradosSimulados * 100) / totalAnunciosSimulados).toFixed(2)) : 0;
  const tasaPublicacionSimulada = totalesSimulados.publicaciones > 0 ? parseFloat(((totalesSimulados.publicaciones_con_anuncio * 100) / totalesSimulados.publicaciones).toFixed(2)) : 0;

  const etiquetaDesempeno = (p) => (p >= 75 ? "Excelente" : p >= 50 ? "Bueno" : p >= 25 ? "Regular" : "Bajo");
  
  const kpisSimulados = {
    desempeno: desempenoSimulado,
    tasa_publicacion: tasaPublicacionSimulada,
    nota: etiquetaDesempeno(desempenoSimulado),
  };
  
  return { ...datosTotales, totales: totalesSimulados, estados: estadosSimulados, kpis: kpisSimulados };
}

/**
 * ⭐ --- NUEVA FUNCIÓN MEJORADA PARA EXPORTAR CSV --- ⭐
 */
function exportCSV(report, filtros) {
  if (!report) return;

  const formatearRangoFechas = () => {
    if (filtros.fecha_inicio || filtros.fecha_fin) {
      const inicio = filtros.fecha_inicio || "Principio";
      const fin = filtros.fecha_fin || "Hoy";
      return `del ${inicio} al ${fin}`;
    }
    return "Histórico Total";
  };

  const aplanarObjeto = (obj, prefijo = '') => {
    return Object.entries(obj).map(([key, value]) => {
        const capitalizado = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        return [`${prefijo}${capitalizado}`, value];
    });
  };

  let csvContent = `Reporte de Desempeño\n`;
  csvContent += `Agente ID:,${report.agente_id || "N/A"}\n`;
  csvContent += `Período:,${formatearRangoFechas()}\n`;
  csvContent += `Fecha de Exportación:,${new Date().toLocaleString('es-ES')}\n\n`;

  csvContent += `KPIs Principales\n`;
  csvContent += `Métrica,Valor\n`;
  aplanarObjeto(report.kpis || {}).forEach(([key, value]) => {
    csvContent += `"${key}",${typeof value === 'number' ? value.toFixed(2) : `"${value}"`}\n`;
  });
  csvContent += `\n`;

  csvContent += `Totales en el Período\n`;
  csvContent += `Métrica,Cantidad\n`;
  aplanarObjeto(report.totales || {}).forEach(([key, value]) => {
    csvContent += `"${key}",${value}\n`;
  });
  csvContent += `\n`;

  csvContent += `Desglose por Estado\n`;
  csvContent += `Estado,Cantidad,Porcentaje (%)\n`;
  Object.entries(report.estados || {}).forEach(([estado, data]) => {
    const capitalizado = estado.charAt(0).toUpperCase() + estado.slice(1);
    csvContent += `${capitalizado},${data.count || 0},${(data.pct || 0).toFixed(2)}\n`;
  });

  // Corrección de codificación para Excel (BOM)
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const date = new Date().toISOString().split("T")[0];
  a.download = `desempeno_agente_${report.agente_id}_${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * ⭐ --- NUEVA FUNCIÓN MEJORADA PARA IMPRIMIR --- ⭐
 */
function printElement(report, filtros) {
  if (!report) return;

  const formatearRangoFechas = () => {
    if (filtros.fecha_inicio || filtros.fecha_fin) {
      const inicio = filtros.fecha_inicio || "Principio";
      const fin = filtros.fecha_fin || "Hoy";
      return `del ${inicio} al ${fin}`;
    }
    return "Histórico Total";
  };

  const kpisHtml = Object.entries(report.kpis || {})
    .map(([key, value]) => `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:</strong> ${value}</li>`)
    .join('');

  const totalesHtml = Object.entries(report.totales || {})
    .map(([key, value]) => `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:</strong> ${value}</li>`)
    .join('');

  const estadosHtml = Object.entries(report.estados || {})
    .map(([estado, data]) => `
      <tr>
        <td>${estado.charAt(0).toUpperCase() + estado.slice(1)}</td>
        <td>${data.count || 0}</td>
        <td>${(data.pct || 0).toFixed(2)}%</td>
      </tr>
    `).join('');

  const printHtml = `
    <!doctype html>
    <html>
    <head>
      <title>Reporte de Desempeño - Agente #${report.agente_id}</title>
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; color: #1c1917; }
        h1, h2, h3 { margin: 0 0 16px; border-bottom: 1px solid #e7e5e4; padding-bottom: 8px; }
        h1 { font-size: 24px; } h2 { font-size: 18px; }
        .header { margin-bottom: 24px; }
        .section { margin-bottom: 24px; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; }
        thead { background-color: #f5f5f4; }
        th, td { padding: 10px; border: 1px solid #e7e5e4; text-align: left; }
        th { font-weight: 600; }
        td:nth-child(2), td:nth-child(3) { text-align: right; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Reporte de Desempeño</h1>
        <p><strong>Agente ID:</strong> ${report.agente_id}</p>
        <p><strong>Período del Reporte:</strong> ${formatearRangoFechas()}</p>
        <p><strong>Fecha de Impresión:</strong> ${new Date().toLocaleString('es-ES')}</p>
      </div>
      <div class="section">
        <h2>KPIs Principales</h2>
        <ul>${kpisHtml}</ul>
      </div>
      <div class="section">
        <h2>Totales en el Período</h2>
        <ul>${totalesHtml}</ul>
      </div>
      <div class="section">
        <h2>Desglose por Estado</h2>
        <table>
          <thead>
            <tr>
              <th>Estado</th>
              <th>Cantidad</th>
              <th>Porcentaje (%)</th>
            </tr>
          </thead>
          <tbody>
            ${estadosHtml}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
  
  const w = window.open("", "PRINT", "height=800,width=1000");
  if (!w) return;
  w.document.write(printHtml);
  w.document.close();
  w.focus();
  w.print();
  w.close();
}


const COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#a78bfa", "#ef4444", "#14b8a6"];


// --- Componente Principal ---

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
        setErr("Sin id de agente en la sesión.");
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
        setErr(e?.response?.data?.message || "No se pudo cargar el reporte");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agenteId]);

  const datosMostrados = useMemo(() => {
    return simularDatosPorPeriodo(datosHistoricos, filtros);
  }, [datosHistoricos, filtros]);

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
        tasa_publicacion: Number(kpis.tasa_publicacion ?? 0)
      },
      notas: `Agente ${report.agente_id ?? ""} • Datos para el período seleccionado.`
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
      const texto = res?.data?.reporte || res?.data?.reporte_ia || res?.data?.values?.reporte || res?.data?.values?.reporte_ia || res?.data?.text || "";
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
  
  const formatearRangoFechas = () => {
    if (filtros.fecha_inicio || filtros.fecha_fin) {
      const inicio = filtros.fecha_inicio ? new Date(filtros.fecha_inicio).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : "principio";
      const fin = filtros.fecha_fin ? new Date(filtros.fecha_fin).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : "hoy";
      return `del ${inicio} al ${fin}`;
    }
    return "histórico total";
  };

  if (loading) {
    return <div className="p-6 text-center text-stone-600">Cargando datos de desempeño...</div>;
  }
  
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Desempeño del Agente #{agenteId}</h1>
          <p className="text-stone-600 text-sm">Mostrando resultados para el período <span className="font-semibold">{formatearRangoFechas()}</span>.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => window.location.reload()} title="Recargar todos los datos desde el servidor" className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50">
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
          <button disabled={!datosMostrados} onClick={() => exportCSV(datosMostrados, filtros)} title="Descargar un reporte CSV profesional de los datos visibles" className="inline-flex items-center gap-2 rounded-xl bg-stone-900 text-white px-3 py-2 text-sm font-medium hover:bg-stone-800 disabled:opacity-50">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button disabled={!datosMostrados} onClick={() => printElement(datosMostrados, filtros)} title="Generar una vista limpia para impresión" className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50 disabled:opacity-50">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button disabled={!datosMostrados || iaLoading} onClick={pedirReporteIA} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50" title="Generar un análisis y recomendaciones con IA (Gemini)">
            <Sparkles className="w-4 h-4" />{iaLoading ? "Generando…" : "Análisis IA"}
          </button>
        </div>
      </div>
      
      <div className="p-4 border rounded-2xl bg-stone-50">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div>
              <label htmlFor="fecha_inicio" className="block text-sm font-medium text-stone-700 mb-1">Filtrar desde</label>
              <input type="date" id="fecha_inicio" value={filtros.fecha_inicio} onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })} className="w-full rounded-xl border-stone-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="fecha_fin" className="block text-sm font-medium text-stone-700 mb-1">Filtrar hasta</label>
              <input type="date" id="fecha_fin" value={filtros.fecha_fin} onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })} className="w-full rounded-xl border-stone-300 shadow-sm" />
            </div>
            <button onClick={limpiarFiltros} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100" title="Quitar filtros y mostrar el reporte histórico completo">
              <XCircle className="w-4 h-4" /> Limpiar
            </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Tasa de Cierre (Desempeño)" value={`${datosMostrados.kpis?.desempeno ?? 0}%`} subtitle={datosMostrados.kpis?.nota || "-"} />
          <KpiCard title="Tasa de Publicación" value={`${datosMostrados.kpis?.tasa_publicacion ?? 0}%`} subtitle="Publicaciones con anuncio" />
          <KpiCard title="Total Publicaciones" value={datosMostrados.totales?.publicaciones ?? 0} subtitle="en período seleccionado" />
          <KpiCard title="Total Anuncios" value={datosMostrados.totales?.anuncios ?? 0} subtitle="en período seleccionado" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card border rounded-2xl p-4">
            <h2 className="font-semibold text-stone-900 mb-2">Índice de Desempeño</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ name: "desempeño", value: datosMostrados.kpis?.desempeno ?? 0 }]} startAngle={90} endAngle={-270}>
                  <RadialBar minAngle={15} background clockWise dataKey="value" fill="#0ea5e9" cornerRadius={10} />
                  <Tooltip formatter={(v) => `${v}%`} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-stone-600 text-sm">{datosMostrados.kpis?.nota || "-"}</p>
          </div>
          
          <div className="card border rounded-2xl p-4">
            <h2 className="font-semibold text-stone-900 mb-2">Distribución por Estado</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={Object.entries(datosMostrados.estados || {}).map(([k, v]) => ({ name: k, value: v?.count ?? 0 }))} cx="50%" cy="50%" outerRadius={100} labelLine={false} label={(entry) => (entry.value > 0 ? `${entry.name} (${entry.value})` : '')}>
                    {Object.keys(datosMostrados.estados || {}).map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Cantidad"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card border rounded-2xl p-4">
            <h2 className="font-semibold text-stone-900 mb-2">Resumen de Totales</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: "Totales", publicaciones: datosMostrados.totales?.publicaciones ?? 0, con_anuncio: datosMostrados.totales?.publicaciones_con_anuncio ?? 0, anuncios: datosMostrados.totales?.anuncios ?? 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="publicaciones" name="Publicaciones" fill={COLORS[0]} />
                  <Bar dataKey="con_anuncio" name="Con Anuncio" fill={COLORS[2]} />
                  <Bar dataKey="anuncios" name="Anuncios" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-stone-900">Análisis con Inteligencia Artificial</h2>
            <div className="flex gap-2">
              <button onClick={pedirReporteIA} disabled={!datosMostrados || iaLoading} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 px-3 py-2 text-sm font-medium hover:bg-indigo-50 disabled:opacity-50">
                <Sparkles className="w-4 h-4" />
                {iaLoading ? "Analizando…" : "Generar Análisis"}
              </button>
              <button onClick={copyIA} disabled={!iaText} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50 disabled:opacity-50">
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
          <div className="bg-stone-50 rounded-xl p-3 text-sm whitespace-pre-wrap min-h-[100px]">
            {iaText ? iaText : <span className="text-stone-500">Haz clic en "Generar Análisis" para obtener un resumen y recomendaciones automáticas sobre el desempeño en el período seleccionado.</span>}
          </div>
        </div>

        <div className="border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="text-left px-4 py-3">Estado del Anuncio</th>
                <th className="text-right px-4 py-3">Cantidad en Período</th>
                <th className="text-right px-4 py-3">% del Período</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(datosMostrados.estados || {}).map(([estado, v], idx) => (
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

        <details className="border rounded-2xl p-4 text-sm text-stone-700">
          <summary className="cursor-pointer font-medium">Ver datos JSON completos (Proyectados)</summary>
          <pre className="mt-3 bg-stone-50 p-3 rounded-xl overflow-auto">{JSON.stringify(datosMostrados, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle }) {
  return (
    <div className="border rounded-2xl p-4 flex flex-col justify-start min-h-[100px]">
      <div>
        <p className="text-stone-600 text-sm font-medium break-words">{title}</p>
        <p className="text-3xl font-semibold text-stone-900">{value}</p>
      </div>
      {subtitle && <p className="text-stone-500 text-xs mt-1 break-words">{subtitle}</p>}
    </div>
  );
}