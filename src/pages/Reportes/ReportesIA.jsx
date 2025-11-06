// src/pages/reportes/PaginaReportes.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
// ✅ --- APIs para AMBOS modos ---
import { 
  generarReporteIA, 
  generarReporteDirecto, 
  exportarReporte 
} from "../../api/reportes/reportes";

// ✅ --- Iconos para AMBOS modos (Search AÑADIDO) ---
import {
  Download, RefreshCw, Loader2, Table2, Coins, Users, CalendarDays,
  FileSearch, ChevronDown, Filter, Sparkles, Mic, MicOff, History,
  Brain, // Icono para Modo IA
  LayoutGrid, // Icono para Modo Rápido
  Search,
} from "lucide-react";

// ✅ --- Gráficas (usadas solo por el modo IA) ---
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

/* ==========================================================================
   1. Helpers & Constantes (Comunes para ambos)
   ========================================================================== */

const nf = (n) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 }).format(n);

const money = (n) =>
  new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

const downloadFile = (blob, defaultFilename, contentDisposition) => {
  const disposition = contentDisposition || "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const filename = match?.[1] || defaultFilename;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// --- Constantes para Modo IA ---
const SUGERENCIAS_IA = [
  "Inmuebles aprobados en Santa Cruz últimos 90 días por agente__nombre con Sum(precio)",
  "Cantidad de inmuebles por estado y tipo_operacion con Count('id')",
  "Contratos activos por tipo_contrato y ciudad con Sum('monto')",
];
const LANGS_IA = [
  { code: "es-BO", label: "Español (Bolivia)" },
  { code: "es-ES", label: "Español (España)" },
];
const CHART_COLORS = [
  "#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6",
  "#0ea5e9", "#14b8a6", "#e11d48",
];

// --- Constantes para Modo Rápido ---
const TIPOS_REPORTE = [
  { v: "inmuebles", label: "Inmuebles" },
  { v: "contratos", label: "Contratos" },
  { v: "citas", label: "Citas" },
  { v: "anuncios", label: "Anuncios" },
  { v: "agentes", label: "Agentes" },
  { v: "clientes", label: "Clientes" },
];
const ESTADO_OPTIONS = {
  inmuebles: [
    { v: "aprobado", label: "Aprobado" },
    { v: "pendiente", label: "Pendiente" },
    { v: "rechazado", label: "Rechazado" },
  ],
  contratos: [
    { v: "activo", label: "Activo" },
    { v: "pendiente", label: "Pendiente" },
    { v: "finalizado", label: "Finalizado" },
    { v: "cancelado", label: "Cancelado" },
  ],
  citas: [
    { v: "CONFIRMADA", label: "Confirmada" },
    { v: "PENDIENTE", label: "Pendiente" },
    { v: "REALIZADA", label: "Realizada" },
    { v: "CANCELADA", label: "Cancelada" },
  ],
  anuncios: [
    { v: "disponible", label: "Disponible" },
    { v: "pendiente", label: "Pendiente" },
    { v: "alquilado", label: "Alquilado" },
    { v: "vendido", label: "Vendido" },
  ],
  agentes: [], clientes: [],
};
const DATE_FIELD_MAP = {
  inmuebles: "anuncio__fecha_publicacion",
  contratos: "fecha_contrato",
  citas: "fecha_cita",
  anuncios: "fecha_publicacion",
  agentes: "date_joined",
  clientes: "date_joined",
};
const MONTO_OPERADORES = [
    { v: "gte", label: "Mayor o igual que (≥)" },
    { v: "lte", label: "Menor o igual que (≤)" },
    { v: "exact", label: "Exactamente (=)" },
];
const TIPO_SOPORTA_MONTO = {
    inmuebles: true, contratos: true, anuncios: true,
    citas: false, agentes: false, clientes: false,
};

/* ==========================================================================
   2. Hooks Personalizados (Solo para Modo IA)
   ========================================================================== */

function usePromptHistory(key = "reportesIA_history", limit = 8) {
  const [history, setHistory] = useState(() => {
    try {
      const h = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(h) ? h.slice(0, limit) : [];
    } catch { return []; }
  });

  const addPromptToHistory = useCallback((prompt) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    const nextHistory = [trimmedPrompt, ...history.filter((p) => p !== trimmedPrompt)].slice(0, limit);
    setHistory(nextHistory);
    localStorage.setItem(key, JSON.stringify(nextHistory));
  }, [history, key, limit]);

  return [history, addPromptToHistory];
}

function useSpeechRecognition({ lang = "es-BO", onEnd } = {}) {
  const recognitionRef = useRef(null);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const manualStopRef = useRef(false);
  const transcriptRef = useRef("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      setIsSupported(true);
      const rec = new SR();
      rec.lang = lang;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        let text = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        const finalTranscript = text.trim();
        setTranscript(finalTranscript);
        transcriptRef.current = finalTranscript;
      };
      rec.onstart = () => {
        setIsListening(true);
        manualStopRef.current = false;
        transcriptRef.current = "";
      };
      rec.onend = () => {
        setIsListening(false);
        if (onEnd) {
          onEnd({
            didStopManually: manualStopRef.current,
            finalTranscript: transcriptRef.current,
          });
        }
        transcriptRef.current = "";
      };
      rec.onerror = (e) => {
        console.error("SpeechRecognition error", e.error);
        setIsListening(false);
        manualStopRef.current = false;
        transcriptRef.current = "";
      };
      recognitionRef.current = rec;
    }
  }, [lang, onEnd]);

  const start = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      manualStopRef.current = false;
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stop = useCallback(() => {
    if (recognitionRef.current && isListening) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, transcript, start, stop, isSupported };
}


/* ==========================================================================
   3. Componentes de UI (Definidos primero)
   ========================================================================== */

// --- Componentes esqueleto (placeholders) ---
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const Card = ({ title, hint, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-lg p-5 ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
    {children}
  </div>
);

const EmptyState = ({ message = "Sin datos suficientes" }) => (
  <div className="h-full flex items-center justify-center text-sm text-gray-500">
    {message}
  </div>
);

// --- Componentes de Input Reutilizables ---
const inputClass = "w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

const SelectInput = ({ label, children, ...props }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="relative">
      <select {...props} className={`${inputClass} appearance-none`}>
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

const TextInput = ({ label, ...props }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input {...props} className={inputClass} />
  </div>
);

const DateInput = ({ label, ...props }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input type="date" {...props} className={`${inputClass} [color-scheme:light]`} />
  </div>
);

// --- Componentes de Layout Reutilizables ---
function PaginaReportesHeader({ mode, setMode, onExportClick, disabled }) {
  const activeClass = "bg-white text-blue-600 shadow-sm";
  const inactiveClass = "bg-transparent text-gray-500 hover:text-gray-700";

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center rounded-xl bg-blue-100 text-blue-700 p-2.5">
          <Table2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Módulo de Reportes
          </h1>
          <p className="text-gray-600">
            Use el modo IA para consultas libres o el modo rápido para filtros comunes.
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-lg bg-gray-200 p-1">
          <button
            onClick={() => setMode('ia')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'ia' ? activeClass : inactiveClass}`}
          >
            <Brain className="w-4 h-4" />
            Modo IA
          </button>
          <button
            onClick={() => setMode('rapido')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'rapido' ? activeClass : inactiveClass}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Reportes Dinamicos
          </button>
        </div>
        
        <button
          onClick={onExportClick}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-sm font-medium text-white shadow-sm hover:bg-gray-700 disabled:opacity-40"
          title="Exportar PDF"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, caption, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <div className="inline-flex items-center justify-center p-2 bg-gray-100 rounded-lg">
           {icon}
        </div>
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1 truncate">
        {title}
      </p>
      {loading ? (
         <div className="h-9 mt-1">
            <div className="animate-pulse h-8 w-3/4 bg-gray-200 rounded-md" />
         </div>
      ) : (
         <p className="text-3xl font-bold text-gray-900 truncate">{value}</p>
      )}
      {caption && <p className="text-xs text-gray-500 mt-2 truncate">{caption}</p>}
    </div>
  );
}

function KpiDashboard({ kpis, loading }) {
  const { totalRegistros, totalMoney, ticketPromedio, moneyCol, rangoTemporal, groupingCol, dataType, type } = kpis;
  
  let totalLabel = "Total Registros";
  if (type === 'agrupado') {
      totalLabel = "Total Grupos";
  } else if (dataType) {
      const tipoLabel = (TIPOS_REPORTE.find(t => t.v === dataType)?.label || 'Registros');
      totalLabel = `Total ${tipoLabel}`;
  }

  let moneyLabel = "Suma Total (N/A)";
  let avgLabel = "Promedio (N/A)";
  if (moneyCol) {
     const cleanName = moneyCol.split('__').pop().replace("monto", "Monto").replace("precio", "Precio").replace("cantidad", "Cantidad");
     moneyLabel = `Total ${cleanName}`;
     avgLabel = `Promedio ${cleanName}`;
     if (moneyCol.toLowerCase().includes("cantidad")) {
        moneyLabel = "Conteo Total";
        avgLabel = "Conteo Promedio";
     } else {
        moneyLabel += " (USD)";
        avgLabel += " (USD)";
     }
  }

  return (
    <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Reporte</h3>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
            title={totalLabel}
            value={nf(totalRegistros)}
            icon={<Users className="w-5 h-5 text-blue-600" />}
            caption={type === 'agrupado' ? "Grupos encontrados" : "Registros encontrados"}
            loading={loading}
        />
        <KpiCard
            title={moneyLabel}
            value={moneyCol ? (moneyLabel.includes("USD") ? money(totalMoney) : nf(totalMoney)) : "—"}
            icon={<Coins className="w-5 h-5 text-emerald-600" />}
            caption={moneyCol ? `Suma de '${moneyCol}'` : "Sin columna de conteo/dinero"}
            loading={loading}
        />
        <KpiCard
            title={avgLabel}
            value={moneyCol ? (avgLabel.includes("USD") ? money(ticketPromedio) : nf(ticketPromedio)) : "—"}
            icon={<Coins className="w-5 h-5 text-amber-600" />}
            caption="Promedio por registro"
            loading={loading}
        />
       <KpiCard
            title={type === 'agrupado' ? "Agrupado por" : "Rango Temporal"}
            value={type === 'agrupado' ? (groupingCol || 'N/A') : (rangoTemporal ? `${rangoTemporal.min} → ${rangoTemporal.max}` : "—")}
            icon={<CalendarDays className="w-5 h-5 text-purple-600" />}
            caption={type === 'agrupado' ? "Dimensión principal" : (rangoTemporal ? `Basado en '${rangoTemporal.col}'` : "Sin filtro de fecha")}
            loading={loading}
        />
        </section>
    </div>
  );
}

function ReporteTabla({ columns, rows, loading }) {
  const formatCell = (row, col) => {
    let v = row?.[col];
    if (typeof v === "number" && Number.isFinite(v)) {
      const lower = col.toLowerCase();
      if (/monto|precio|importe|total|comision/.test(lower)) return money(v);
      return nf(v);
    }
    if (v && typeof v === "string") {
      const isDate = /^\d{4}-\d{2}-\d{2}/.test(v);
      if (isDate) {
        const d = new Date(v);
        if (!isNaN(d.getTime())) return d.toLocaleDateString("es-BO");
      }
    }
    if (v === null || v === undefined || v === "") return "—";
    return String(v);
  };
  
  const cleanHeader = (col) => {
     return col.replace(/__/g, " ")
              .replace("nombre", "")
              .replace("inmueble ", "")
              .replace("agente", "Agente")
              .replace("tipo ", "Tipo")
              .replace("estado", "Estado")
              .replace("titulo", "Título")
              .trim();
  }

  return (
    <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados Detallados</h3>
        <div className="overflow-hidden rounded-2xl shadow-lg bg-white">
            <div className="overflow-x-auto max-h-[600px]">
                <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                    {columns.map((col) => (
                        <th key={col} className="text-left font-semibold text-gray-600 px-4 py-3 border-b border-gray-200 whitespace-nowrap capitalize">
                        {cleanHeader(col)}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                           <tr key={i}>
                            {Array.from({ length: Math.max(columns.length || 0, 4) }).map((_, j) => (
                                <td key={j} className="px-4 py-3 border-b border-gray-100">
                                    <div className="animate-pulse h-4 w-3/4 bg-gray-200 rounded-md" />
                                </td>
                            ))}
                           </tr>
                        ))
                    ) : !rows.length ? (
                    <tr>
                        <td colSpan={columns.length || 1} className="px-4 py-12 text-center text-gray-500">
                        <FileSearch className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                        Sin datos. Seleccione un modo y genere un reporte.
                        </td>
                    </tr>
                    ) : (
                    rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                        {columns.map((col) => (
                            <td key={col} className="px-4 py-3 border-b border-gray-100 whitespace-nowrap text-gray-700">
                            {formatCell(row, col)}
                            </td>
                        ))}
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
        </div>
        <p className="mt-3 text-xs text-gray-600">
            Mostrando {nf(rows.length)} filas.
        </p>
    </div>
  );
}

// --- Componentes Específicos de Modo IA ---
const ReporteGraficos = ({ data, loading }) => {
  const { pieData, pieCol, topBarData, barCol } = data;
  
  return (
    <section className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-5">
      <Card title={`Distribución ${pieCol ? `(${pieCol})` : "(categoría)"}`}>
        <div className="h-72">
          {loading ? (
            <Skeleton className="h-full" />
          ) : pieData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Legend />
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </div>
      </Card>
      <Card title={`Top 5 por ${barCol || "categoría"}`} hint="Ordenado por cantidad" className="xl:col-span-2">
        <div className="h-72">
          {loading ? (
            <Skeleton className="h-full" />
          ) : topBarData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <RTooltip />
                <Bar dataKey="count" name="Cantidad" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </div>
      </Card>
    </section>
  );
};


/* ==========================================================================
   4. Componente "Hijo": Modo IA
   ========================================================================== */

function ReporteModoIA({ onDataReady, onLoading, onError, onExport }) {
  const [prompt, setPrompt] = useState("");
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("es-BO");
  const [history, addPromptToHistory] = usePromptHistory();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const triggerSubmit = useCallback(async (promptToSubmit) => {
    if (!promptToSubmit.trim()) {
      setError("El prompt no puede estar vacío.");
      return;
    }
    setPrompt(promptToSubmit);
    setLoading(true);
    onError(""); 
    onLoading(true); 
    
    try {
      const resp = await generarReporteIA(promptToSubmit);
      const data = Array.isArray(resp?.data) ? resp.data : [];
      setRows(data);
      onDataReady(data, 'ia', data[0] ? Object.keys(data[0])[0] : 'ia'); // Pasa el tipo de dato
      addPromptToHistory(promptToSubmit);
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.error || "No se pudo generar el reporte (IA).";
      setError(errorMsg);
      onError(errorMsg); 
      setRows([]);
      onDataReady([], 'ia', 'ia'); 
    } finally {
      setLoading(false);
      onLoading(false); 
    }
  }, [addPromptToHistory, onDataReady, onError, onLoading]);

  const handleVoiceEnd = useCallback(({ didStopManually, finalTranscript }) => {
    if (!didStopManually && finalTranscript.trim().length > 0) {
      triggerSubmit(finalTranscript);
    }
  }, [triggerSubmit]);

  const { isListening, transcript, start, stop, isSupported } = useSpeechRecognition({
    lang,
    onEnd: handleVoiceEnd,
  });

  useEffect(() => {
    if (transcript) setPrompt(transcript);
  }, [transcript]);

  const handlePromptChange = (e) => {
    if (isListening) stop();
    setPrompt(e.target.value);
  };
  
  const handleVoiceToggle = () => {
    if (isListening) stop();
    else {
      setPrompt("");
      start();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isListening) stop();
    triggerSubmit(prompt);
  };

  // ✅ --- CORRECCIÓN DE EXPORTACIÓN ---
  useEffect(() => {
    onExport(() => { // Quita un () => de aquí
        if (!rows.length) {
          alert("Primero debe generar un reporte para exportar.");
          return;
        }
        exportarReporte({ data: rows, formato: "pdf", prompt })
          .then(res => {
            const fallback = `reporte_ia_${new Date().toISOString().slice(0, 10)}.pdf`;
            downloadFile(res.data, fallback, res.headers?.["content-disposition"]);
          })
          .catch(err => {
            console.error(err);
            setError("No se pudo exportar el PDF.");
          });
    });
  }, [rows, prompt, onExport]); // Dependencias correctas

  const { filteredRows, chartData } = useMemo(() => {
    const q = query.toLowerCase();
    const fRows = !query.trim()
      ? rows
      : rows.filter((r) =>
          Object.values(r ?? {}).some((v) =>
            String(v ?? "").toLowerCase().includes(q)
          )
        );

    const keys = Array.from(new Set(rows.flatMap(r => Object.keys(r || {}))));
    const agentCols = keys.filter((c) => /agente/i.test(c));
    const cityCols = keys.filter((c) => /ciudad/i.test(c));
    const stateCols = keys.filter((c) => /estado/i.test(c));

    const pieCol = stateCols[0] || agentCols[0] || cityCols[0] || keys.find((c) => typeof fRows?.[0]?.[c] === "string");
    let pieData = [];
    if (pieCol) {
      const count = new Map();
      fRows.forEach((r) => {
        const k = String(r?.[pieCol] ?? "—");
        count.set(k, (count.get(k) || 0) + 1);
      });
      pieData = Array.from(count.entries()).map(([name, value]) => ({ name, value }));
    }
    const barCol = agentCols[0] || cityCols[0] || keys.find((c) => /tipo|categoria|inmueble|prioridad/i.test(c));
    let topBarData = [];
    if (barCol) {
      const agg = new Map();
      fRows.forEach((r) => {
        const k = String(r?.[barCol] ?? "—");
        agg.set(k, (agg.get(k) || 0) + 1);
      });
      topBarData = Array.from(agg.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }
    return { filteredRows: fRows, chartData: { pieData, pieCol, topBarData, barCol } };
  }, [rows, query]);
  
  useEffect(() => {
    onDataReady(filteredRows, 'ia', filteredRows[0] ? Object.keys(filteredRows[0])[0] : 'ia');
  }, [filteredRows, onDataReady]);

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-5">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-5">
           <Sparkles className="w-5 h-5 text-purple-600" />
           <h3 className="text-lg font-semibold text-gray-900">
              Consulta con Lenguaje Natural (IA)
           </h3>
        </div>
        
        <label htmlFor="prompt-textarea" className="block text-sm font-medium text-gray-700 mb-1.5">
          Escribe o dicta tu solicitud
        </label>
        <textarea
          id="prompt-textarea"
          value={prompt}
          onChange={handlePromptChange}
          placeholder='Ej: "Inmuebles aprobados del último mes por agente__nombre con Sum(precio)"'
          className="w-full h-24 resize-y rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isSupported && (
              <>
                <select
                  className="rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  title="Idioma del dictado"
                >
                  {LANGS_IA.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white shadow-sm ${isListening ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                  title={isListening ? "Detener dictado" : "Dictar"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isListening ? "Grabando…" : "Dictar"}
                </button>
              </>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generando...</>
            ) : (
              <><RefreshCw className="w-5 h-5" /> Generar Reporte</>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-gray-100">
          {SUGERENCIAS_IA.map((s, i) => (
            <button key={i} type="button" onClick={() => setPrompt(s)} className="px-3 py-1.5 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
              <Sparkles className="inline size-3 mr-1 text-purple-500" /> {s}
            </button>
          ))}
          {history.map((s, i) => (
            <button key={`h-${i}`} type="button" onClick={() => setPrompt(s)} className="px-3 py-1.5 rounded-full text-xs bg-blue-50 text-blue-700 hover:bg-blue-100" title="Del historial">
              <History className="inline size-3 mr-1" /> {s}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:max-w-sm mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en resultados..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border-gray-300 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
      
      <ReporteGraficos data={chartData} loading={loading} />
    </>
  );
}

/* ==========================================================================
   4. Componente "Hijo": Modo Rápido
   ========================================================================== */

function ReporteModoRapido({ onDataReady, onLoading, onError, onExport }) {
  const [tipo, setTipo] = useState("inmuebles");
  const [filtros, setFiltros] = useState({
    estado: "", ciudad: "", fechaDesde: "", fechaHasta: "",
    montoOp: "gte", montoValor: "",
  });
  
  const [rows, setRows] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetFiltros = () => {
    setFiltros({
      estado: "", ciudad: "", fechaDesde: "", fechaHasta: "",
      montoOp: "gte", montoValor: "",
    });
  };

  const doGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    onError("");
    onLoading(true);
    
    const builderJson = { tipo, filtros };

    try {
      const resp = await generarReporteDirecto(builderJson);
      const data = Array.isArray(resp?.data) ? resp.data : [];
      setRows(data);
      onDataReady(data, 'rapido', tipo); 
    } catch (e) {
      console.error(e);
      const errorMsg = e?.response?.data?.error || "No se pudo generar el reporte.";
      setError(errorMsg);
      onError(errorMsg);
      setRows([]);
      onDataReady([], 'rapido', tipo);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  // ✅ --- CORRECCIÓN DE EXPORTACIÓN ---
  useEffect(() => {
    onExport(() => { // Quita un () => de aquí
        if (!rows.length) {
            alert("Primero debe generar un reporte para exportar.");
            return;
        }
        const prompt = `Reporte Rápido de ${tipo}`;
        exportarReporte({ data: rows, formato: "pdf", prompt })
            .then(res => {
                const fallback = `reporte_rapido_${tipo}_${new Date().toISOString().slice(0, 10)}.pdf`;
                downloadFile(res.data, fallback, res.headers?.["content-disposition"]);
            })
            .catch(err => {
                console.error(err);
                setError("No se pudo exportar el PDF.");
            });
    });
  }, [rows, tipo, onExport]); // Dependencias correctas

  const handleTipoChange = (e) => {
    const newTipo = e.target.value;
    setTipo(newTipo);
    resetFiltros();
    setRows([]);
    onDataReady([], 'rapido', newTipo);
    setError("");
    onError("");
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const estadoOptions = ESTADO_OPTIONS[tipo] || [];
  const soportaMonto = TIPO_SOPORTA_MONTO[tipo];

  return (
    <form onSubmit={doGenerate} className="bg-white rounded-2xl shadow-lg p-5">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-5">
         <Filter className="w-5 h-5 text-blue-600" />
         <h3 className="text-lg font-semibold text-gray-900">
            Filtros del Reporte Rápido
         </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectInput label="1. Tipo de Reporte" value={tipo} onChange={handleTipoChange}>
          {TIPOS_REPORTE.map((t) => (
            <option key={t.v} value={t.v}>{t.label}</option>
          ))}
        </SelectInput>
        <SelectInput
          label="2. Estado"
          name="estado"
          value={filtros.estado}
          onChange={handleFiltroChange}
          disabled={estadoOptions.length === 0}
        >
          <option value="">Todos</option>
          {estadoOptions.map((opt) => (
            <option key={opt.v} value={opt.v}>{opt.label}</option>
          ))}
        </SelectInput>
        <TextInput
          label="3. Ciudad"
          name="ciudad"
          value={filtros.ciudad}
          onChange={handleFiltroChange}
          placeholder="Ej: Santa Cruz"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <DateInput
          label="4. Fecha Desde"
          name="fechaDesde"
          value={filtros.fechaDesde}
          onChange={handleFiltroChange}
        />
        <DateInput
          label="5. Fecha Hasta"
          name="fechaHasta"
          value={filtros.fechaHasta}
          onChange={handleFiltroChange}
        />
        <SelectInput
          label="6. Monto"
          name="montoOp"
          value={filtros.montoOp}
          onChange={handleFiltroChange}
          disabled={!soportaMonto}
        >
          {MONTO_OPERADORES.map((opt) => (
              <option key={opt.v} value={opt.v}>{opt.label}</option>
          ))}
        </SelectInput>
        <TextInput
          label="Valor del Monto"
          name="montoValor"
          type="number"
          value={filtros.montoValor}
          onChange={handleFiltroChange}
          placeholder="Ej: 50000"
          disabled={!soportaMonto}
        />
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generando…</>
          ) : (
            <><RefreshCw className="w-5 h-5" /> Generar Reporte</>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {error}
        </div>
      )}
    </form>
  );
}


/* ==========================================================================
   5. Componente "Padre": El Contenedor Principal
   ========================================================================== */

export default function PaginaReportes() {
  const [mode, setMode] = useState('ia'); // 'ia' (default) | 'rapido'
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportInfo, setReportInfo] = useState({ type: 'ia', dataType: 'inmuebles' });
  
  const exportHandler = useRef(null);

  const handleDataReady = useCallback((data, mode, dataType) => {
    setRows(data);
    
    let isGrouped = false;
    if (mode === 'ia') {
      // Modo IA: es agrupado si no tiene 'id' y tiene al menos 1 fila
      isGrouped = data.length > 0 && data[0].id === undefined;
    } else {
      // Modo Rápido: es agrupado por defecto, EXCEPTO para agentes y clientes
      isGrouped = dataType !== 'agentes' && dataType !== 'clientes';
    }

    setReportInfo({ 
      type: isGrouped ? 'agrupado' : 'lista',
      dataType: dataType || 'reporte'
    });
  }, []);

  const { columns, kpis } = useMemo(() => {
    const { type, dataType } = reportInfo;
    
    const defaultKpis = { totalRegistros: 0, totalMoney: 0, ticketPromedio: 0, moneyCol: null, rangoTemporal: null, groupingCol: null };
    if (!rows.length) {
      return { columns: [], kpis: defaultKpis };
    }
    
    const keys = Array.from(new Set(rows.flatMap(r => Object.keys(r || {}))));
    const moneyCols = keys.filter(c => /monto|precio|importe|total|comision|cantidad/i.test(c));
    const moneyCol = moneyCols[0];
    
    const dateFieldKey = DATE_FIELD_MAP[dataType] || '';
    const dateCol = keys.find(k => k.includes(dateFieldKey.split('__').pop() || 'fecha'));

    const totalRegistros = rows.length;
    
    const totalMoney = moneyCol ? rows.reduce((acc, row) => {
      const v = Number(row?.[moneyCol]);
      return acc + (Number.isFinite(v) ? v : 0);
    }, 0) : (type === 'lista' ? totalRegistros : 0);

    const ticketPromedio = totalRegistros && totalMoney > 0 ? totalMoney / totalRegistros : 0;

    let rangoTemporal = null;
    if (dateCol) {
        const fechas = rows.map(r => new Date(r?.[dateCol])).filter(d => !isNaN(d.getTime())).sort((a, b) => a - b);
        if (fechas.length) {
            rangoTemporal = {
                col: dateCol.split('__').pop(),
                min: fechas[0].toLocaleDateString("es-BO"),
                max: fechas[fechas.length - 1].toLocaleDateString("es-BO"),
            };
        }
    }
    
    const groupingCol = type === 'agrupado' ? keys.find(k => k !== moneyCol && k !== 'id') : null;
    
    return { 
      columns: keys, 
      kpis: { totalRegistros, totalMoney, ticketPromedio, moneyCol, rangoTemporal, groupingCol, dataType, type }
    };
  }, [rows, reportInfo]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 lg:px-8">
        
        <PaginaReportesHeader
          mode={mode}
          setMode={(newMode) => {
             setMode(newMode);
             setRows([]); 
             setError("");
             setReportInfo({ type: newMode, dataType: 'inmuebles' });
          }}
          onExportClick={() => exportHandler.current ? exportHandler.current() : alert("Genere un reporte primero.")}
          disabled={!rows.length || loading}
        />

        {mode === 'ia' ? (
          <ReporteModoIA
            onDataReady={handleDataReady}
            onLoading={setLoading}
            onError={setError}
            onExport={fn => (exportHandler.current = fn)}
          />
        ) : (
          <ReporteModoRapido
            onDataReady={handleDataReady}
            onLoading={setLoading}
            onError={setError}
            onExport={fn => (exportHandler.current = fn)}
          />
        )}

        <section className="mt-8">
          <KpiDashboard kpis={kpis} loading={loading} />
          <ReporteTabla columns={columns} rows={rows} loading={loading} />
          {error && !loading && (
             <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                <strong>Error:</strong> {error}
             </div>
          )}
        </section>

      </div>
    </div>
  );
}