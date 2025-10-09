import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getInmuebleById } from "../../api/inmueble/index";

const FALLBACK = "https://images.unsplash.com/photo-1501183638710-841dd1904471";

// Normaliza URLs relativas a absolutas usando VITE_API_URL
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const normalizeUrl = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  // si viene "/media/..." u otra ruta relativa
  return `${API_BASE}/${String(u).replace(/^\/+/, "")}`;
};

// Ajusta la URL para solicitar tamaños/calidad cuando el proveedor lo soporta
const tuned = (url, width, quality = 85) => {
  try {
    const u = new URL(url);
    const host = u.hostname;

    // Unsplash
    if (host.includes("unsplash.com") || host.includes("images.unsplash.com")) {
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", String(quality));
      return u.toString();
    }

    // Cloudinary
    if (host.includes("res.cloudinary.com")) {
      const parts = u.pathname.split("/image/upload/");
      if (parts.length === 2) {
        u.pathname = `${parts[0]}/image/upload/w_${width},q_${quality}/${parts[1]}`;
        return u.toString();
      }
    }

    // Otros proveedores: devolvemos tal cual
    return url;
  } catch {
    return url;
  }
};

export default function InmuebleDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state } = useLocation(); // datos pasados desde el listado
  const [data, setData] = useState(state || null);
  const [loading, setLoading] = useState(!state);

  // si recargas la página y no hay state, trae del backend por i

useEffect(() => {
  if (state) return;
  // 🔒 Validar que el id sea un número
  if (!/^\d+$/.test(id)) {
    console.warn("ID inválido:", id);
    setLoading(false);
    setData(null);
    return;
  }

  (async () => {
    try {
      const res = await getInmuebleById(Number(id));
      const d = res?.data?.values?.inmueble || res?.data?.values || res?.data;
      setData(d);
    } finally {
      setLoading(false);
    }
  })();
}, [id, state]);

  const fotos = useMemo(() => {
    const arr = Array.isArray(data?.fotos) ? data.fotos : [];
    return arr.map((f) => normalizeUrl(f?.url)).filter(Boolean);
  }, [data]);

  const [current, setCurrent] = useState(0);
  useEffect(() => setCurrent(0), [fotos.length]);

  if (loading) return <div className="p-6">Cargando inmueble…</div>;
  if (!data) {
    return (
      <div className="p-6">
        <button className="mb-4 text-blue-600" onClick={() => nav(-1)}>
          ← Volver
        </button>
        <p>No se encontró el inmueble #{id}.</p>
      </div>
    );
  }

  const hero = fotos[current] || fotos[0] || FALLBACK;

  return (
    <div className="p-0 md:p-6">
      <div className="bg-white md:rounded-2xl md:border overflow-hidden">
        {/* HERO: 16:9, cover y versions HD con srcSet/sizes */}
        <div className="relative bg-stone-100 max-w-6xl mx-auto">
          {/* 16:9 => 9/16 = 56.25% */}
          <div className="pt-[56.25%]" />
          <img
            src={tuned(hero, 1200)}
            srcSet={[
              `${tuned(hero, 800)} 800w`,
              `${tuned(hero, 1200)} 1200w`,
              `${tuned(hero, 1600)} 1600w`,
              `${tuned(hero, 2000)} 2000w`,
            ].join(", ")}
            sizes="(min-width: 1280px) 1200px, (min-width: 768px) 90vw, 100vw"
            alt={data.titulo}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          {fotos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {current + 1}/{fotos.length}
            </div>
          )}
        </div>

        {/* THUMBS: tamaño fijo, cover y ring activo (con srcSet también) */}
        {fotos.length > 1 && (
          <div className="flex gap-3 p-3 overflow-x-auto bg-stone-50 max-w-6xl mx-auto">
            {fotos.map((url, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`relative h-20 w-32 rounded-lg overflow-hidden border transition ${
                  i === current ? "ring-2 ring-blue-500" : "hover:opacity-90"
                }`}
                title={`Foto ${i + 1}`}
              >
                <img
                  src={tuned(url, 320, 85)}
                  srcSet={`${tuned(url, 320)} 320w, ${tuned(url, 640)} 640w`}
                  sizes="200px"
                  alt={`foto ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        )}

        {/* BODY */}
        <div className="p-6 bg-stone-50">
          <h1 className="text-2xl font-bold">{data.titulo}</h1>
          <p className="text-stone-600 mt-2">{data.descripcion || ""}</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <p>
              {data.direccion}
              {data?.ciudad ? `, ${data.ciudad}` : ""}
            </p>
            {data?.zona && <p> Zona: {data.zona}</p>}
            <p>
              Precio:{" "}
              {Number(data?.precio || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            {data?.tipo && <p> Tipo: {String(data.tipo).toUpperCase()}</p>}
            {data?.dormitorios != null && (
              <p> Dormitorios: {data.dormitorios}</p>
            )}
            {data?.banos != null && <p> Baños: {data.banos}</p>}
            {data?.area != null && <p> Área: {data.area} m²</p>}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              onClick={() =>
                alert("Aquí puedes abrir el chat/WhatsApp del agente.")
              }
            >
              Contactar agente
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300"
              onClick={() => nav(-1)}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
