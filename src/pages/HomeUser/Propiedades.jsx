import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ListadoInmuebles from "../inmuebles/ListadoInmuebles";

export default function Propiedades() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const tipo = (params.get("tipo") || "").toLowerCase(); // venta | alquiler | anticretico | ""

  const setTipo = (value) => {
    const url = value
      ? `/propiedades?tipo=${encodeURIComponent(value)}`
      : "/propiedades";
    // replace:true para no crear una entrada de historial por cada click
    nav(url, { replace: true });
  };

  // UX: al cambiar filtro, subimos al top (útil con listas largas)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tipo]);

  const btnBase =
    "px-3 py-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1";
  const btnOn = "bg-blue-600 text-white border-blue-600";
  const btnOff = "hover:bg-stone-100 border-stone-300 text-stone-700";

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setTipo("venta")}
          aria-pressed={tipo === "venta"}
          className={`${btnBase} ${tipo === "venta" ? btnOn : btnOff}`}
        >
          En venta
        </button>
        <button
          onClick={() => setTipo("alquiler")}
          aria-pressed={tipo === "alquiler"}
          className={`${btnBase} ${tipo === "alquiler" ? btnOn : btnOff}`}
        >
          En alquiler
        </button>
        <button
          onClick={() => setTipo("anticretico")}
          aria-pressed={tipo === "anticretico"}
          className={`${btnBase} ${tipo === "anticretico" ? btnOn : btnOff}`}
        >
          En anticrético
        </button>
        <button
          onClick={() => setTipo("")}
          aria-pressed={!tipo}
          className={`${btnBase} ${!tipo ? btnOn : btnOff}`}
        >
          Todas
        </button>
      </div>

      {/* Reutilizamos el mismo Listado pero con basePath público */}
      <ListadoInmuebles tipo={tipo || undefined} basePath="/propiedades" />
    </div>
  );
}
