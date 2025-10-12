// src/components/BadgeEstadoAnuncio.jsx
import { useEffect, useState } from "react";
import { getEstadoAnuncioById } from "../api/inmueble/anuncios";

const clsByEstado = (estado, activo) => {
  const on = !!activo;
  switch ((estado || "").toLowerCase()) {
    case "disponible":
      return on ? "bg-green-600 text-white" : "bg-gray-600 text-white";
    case "vendido":
      return on ? "bg-red-600 text-white" : "bg-gray-600 text-white";
    case "alquilado":
      return on ? "bg-amber-600 text-white" : "bg-gray-600 text-white";
    case "anticretico":
      return on ? "bg-indigo-600 text-white" : "bg-gray-600 text-white";
    default:
      return "bg-stone-500 text-white";
  }
};

export default function BadgeEstadoAnuncio({ anuncioId, refreshKey = 0 }) {
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState(null);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    let alive = true;

    const fetchEstado = async () => {
      if (!anuncioId) {
        setEstado(null);
        setActivo(false);
        return;
      }
      setLoading(true);
      try {
        const resp = await getEstadoAnuncioById(anuncioId);
        // resp.values.anuncio: { id, estado, is_active }
        const an = resp?.values?.anuncio || null;
        if (alive) {
          setEstado(an?.estado || null);
          setActivo(!!an?.is_active);
        }
      } catch (e) {
        if (alive) {
          setEstado(null);
          setActivo(false);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchEstado();
    return () => {
      alive = false;
    };
  }, [anuncioId, refreshKey]);

  if (!anuncioId) {
    return (
      <span className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold bg-stone-400 text-white">
        Sin anuncio
      </span>
    );
  }

  if (loading) {
    return (
      <span className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold bg-stone-300 text-stone-800 animate-pulse">
        Consultando…
      </span>
    );
  }

  const texto = estado
    ? `${estado.charAt(0).toUpperCase()}${estado.slice(1)}${activo ? "" : " • Inactivo"}`
    : "Sin datos";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold shadow ${clsByEstado(
        estado,
        activo
      )}`}
      title={`Estado: ${texto}`}
    >
      {texto}
    </span>
  );
}
