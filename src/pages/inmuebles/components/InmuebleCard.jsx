import { useEffect, useState } from "react";
import instancia from "../../../api/axios";

// Intenta consultar el estado probando varias rutas soportadas
async function fetchEstadoAnuncio({ anuncioId, inmuebleId }) {
  // helper que intenta una URL y devuelve null si falla
  const tryGet = async (url) => {
    try {
      const { data } = await instancia.get(url);
      const an = data?.values?.anuncio ?? null;
      return an
        ? { exists: true, estado: an.estado || null, is_active: !!an.is_active }
        : { exists: false, estado: null, is_active: false };
    } catch (e) {
      return null; // para que el caller pruebe la siguiente forma
    }
  };

  // 1) Por anuncio id
  if (anuncioId) {
    const r1 = await tryGet(`inmueble/anuncio/${anuncioId}/estado/`);
    if (r1) return r1;
  }

  // 2) Por inmueble id (ruta tipo /inmueble/anuncio/<inmueble_id>/estado/)
  if (inmuebleId) {
    const r2 = await tryGet(`inmueble/anuncio/${inmuebleId}/estado/`);
    if (r2) return r2;
  }

  // 3) Por query param (ruta tipo /inmueble/anuncio/estado?inmueble=<id>)
  if (inmuebleId) {
    const r3 = await tryGet(`inmueble/anuncio/estado?inmueble=${encodeURIComponent(inmuebleId)}`);
    if (r3) return r3;
  }

  // Si nada funcionó: sin anuncio
  return { exists: false, estado: null, is_active: false };
}

function BadgeEstadoAnuncio({ anuncioId, inmuebleId, refreshKey = 0 }) {
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [estado, setEstado] = useState(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let cancel = false;

    (async () => {
      setLoading(true);
      const res = await fetchEstadoAnuncio({ anuncioId, inmuebleId });
      if (!cancel) {
        setExists(res.exists);
        setEstado(res.estado);
        setIsActive(res.is_active);
        setLoading(false);
      }
    })();

    return () => { cancel = true; };
  }, [anuncioId, inmuebleId, refreshKey]);

  if (loading) {
    return (
      <span className="absolute left-3 top-3 z-30 rounded-full px-2.5 py-1 text-xs font-semibold text-white bg-gray-500/70">
        Cargando…
      </span>
    );
  }

  if (!exists) {
    return (
      <span className="absolute left-3 top-3 z-30 rounded-full px-2.5 py-1 text-xs font-semibold text-white bg-gray-600">
        Sin anuncio
      </span>
    );
  }

  const k = String(estado || "").toLowerCase();
  const map = {
    disponible:  { text: isActive ? "Disponible" : "Disponible • Inactivo", cls: isActive ? "bg-green-600"  : "bg-gray-700" },
    vendido:     { text: isActive ? "Vendido"    : "Vendido • Inactivo",    cls: isActive ? "bg-red-600"    : "bg-gray-700" },
    alquilado:   { text: isActive ? "Alquilado"  : "Alquilado • Inactivo",  cls: isActive ? "bg-amber-600"  : "bg-gray-700" },
    anticretico: { text: isActive ? "Anticrético": "Anticrético • Inactivo",cls: isActive ? "bg-indigo-600" : "bg-gray-700" },
  };
  const conf = map[k] || { text: "—", cls: "bg-gray-600" };

  return (
    <span
      className={`absolute left-3 top-3 z-30 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow ${conf.cls}`}
      style={{ pointerEvents: "none" }}
    >
      {conf.text}
    </span>
  );
}

export default function InmuebleCard({ data, onClick, showBadge = true, refreshKey = 0 }) {
  const fotos = Array.isArray(data?.fotos) ? data.fotos : [];
  const hero = fotos.length ? fotos[0].url : null;

  const anuncioId  = data?.anuncio?.id || null; // puede NO venir
  const inmuebleId = data?.id;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border cursor-pointer relative" onClick={onClick}>
      {showBadge && (
        <BadgeEstadoAnuncio anuncioId={anuncioId} inmuebleId={inmuebleId} refreshKey={refreshKey} />
      )}

      {hero ? (
        <img src={hero} alt={data?.titulo} className="w-full h-56 object-cover" />
      ) : (
        <div className="w-full h-56 bg-stone-200 grid place-items-center text-stone-500">Sin fotos</div>
      )}

      <div className="p-5 bg-stone-50">
        <h3 className="font-semibold text-xl text-stone-900 leading-tight">{data?.titulo}</h3>
        <p className="text-stone-600 mt-1">
          {data?.direccion}{data?.ciudad ? `, ${data.ciudad}` : ""}
        </p>
        <p className="mt-2 font-semibold text-blue-600">
          Precio: {Number(data?.precio || 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
