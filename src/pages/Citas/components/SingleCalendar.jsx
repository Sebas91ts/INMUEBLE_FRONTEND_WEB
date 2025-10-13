import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Calendario de un solo mes con navegación.
 * Props:
 *  - byDate: Map<string, Cita[]> (clave 'YYYY-MM-DD') para puntito en días con cita
 *  - onDayClick: (dateStr: string) => void
 */
export default function SingleCalendar({ byDate, onDayClick }) {
  const [monthOffset, setMonthOffset] = useState(0);

  const goPrev = useCallback(() => setMonthOffset((v) => v - 1), []);
  const goNext = useCallback(() => setMonthOffset((v) => v + 1), []);

  const view = useMemo(() => {
    const base = new Date();
    return new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const label = view.toLocaleString("es-ES", { month: "long", year: "numeric" });

  const firstDow = new Date(year, month, 1).getDay(); // 0..6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks = useMemo(() => {
    const pad = (n) => String(n).padStart(2, "0");
    const result = [];
    let d = 1 - firstDow;
    for (let w = 0; w < 6; w++) {
      const row = [];
      for (let i = 0; i < 7; i++, d++) {
        const inMonth = d >= 1 && d <= daysInMonth;
        const dateStr = inMonth ? `${year}-${pad(month + 1)}-${pad(d)}` : null;
        row.push({ inMonth, day: inMonth ? d : "", dateStr });
      }
      result.push(row);
      if (d > daysInMonth) break;
    }
    return result;
  }, [firstDow, daysInMonth, month, year]);

  return (
    <div className="relative rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-center mb-3">
        {/* Botón anterior */}
        <button
          onClick={goPrev}
          className="absolute left-3 top-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200"
          aria-label="Mes anterior"
          title="Mes anterior"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>

        <div className="font-semibold capitalize text-slate-900">{label}</div>

        {/* Botón siguiente */}
        <button
          onClick={goNext}
          className="absolute right-3 top-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200"
          aria-label="Mes siguiente"
          title="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* Días de semana */}
      <div className="grid grid-cols-7 gap-2 text-[12px] text-slate-500 mb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7 gap-2">
        {weeks.flat().map((cell, idx) => (
          <button
            key={idx}
            disabled={!cell.inMonth}
            onClick={() => cell.dateStr && onDayClick?.(cell.dateStr)}
            className={
              "h-12 rounded-xl text-sm transition outline-offset-2 " +
              (cell.inMonth
                ? "bg-slate-50 hover:bg-slate-100 focus:outline-sky-600"
                : "bg-transparent text-transparent cursor-default")
            }
            title={cell.dateStr || ""}
          >
            <div className="text-slate-700">{cell.day}</div>
            {cell.dateStr && byDate?.get(cell.dateStr)?.length > 0 && (
              <div className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-sky-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
