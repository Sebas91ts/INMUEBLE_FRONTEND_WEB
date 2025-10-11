import { useMemo } from "react";

const NAMES = ["Ddomingo","Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"];

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}
function ym(date) {
  return { y: date.getFullYear(), m: date.getMonth() }; // 0..11
}
function daysOfMonth(y, m) {
  const first = new Date(y, m, 1);
  const last  = new Date(y, m + 1, 0);
  const pad   = (first.getDay() + 7) % 7; // domingo=0
  const total = last.getDate();
  const cells = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return { first, last, cells };
}

export default function MiniCalendar({ monthsFromNow = 0, byDate, onDayClick }) {
  const base = useMemo(() => addMonths(new Date(), monthsFromNow), [monthsFromNow]);
  const { y, m } = ym(base);
  const { cells } = daysOfMonth(y, m);
  const title = base.toLocaleDateString("es-BO", { month: "long", year: "numeric" });

  const has = (d) => {
    const key = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return (byDate?.get(key)?.length ?? 0) > 0;
  };

  return (
    <div>
      <div className="text-center font-semibold mb-2 capitalize">{title}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-slate-500 text-sm mb-1">
        {NAMES.map((n) => <div key={n}>{n}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <button
            key={i}
            disabled={!d}
            onClick={() => {
              const key = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
              onDayClick?.(key);
            }}
            className={
              "h-9 rounded-lg text-sm " +
              (!d
                ? "bg-transparent"
                : "bg-slate-50 hover:bg-slate-100 relative")
            }
          >
            {d ?? ""}
            {d && has(d) && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
          </button>
        ))}
      </div>
    </div>
  );
}
