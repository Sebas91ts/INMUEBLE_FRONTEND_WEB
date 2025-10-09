import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInmuebles } from "../../api/inmueble/inmuebles";

export default function ListadoInmuebles({
  tipo,
  basePath = "/dashboard/inmuebles",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  // Helpers para mejorar calidad de imagen y normalizar URLs
  const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const normalizeUrl = (u) => {
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u; // ya es absoluta
    return `${API_BASE}/${String(u).replace(/^\/+/, "")}`;
  };
  const tuned = (url, width, quality = 85) => {
    try {
      const u = new URL(url);
      const host = u.hostname;
      // Unsplash
      if (
        host.includes("unsplash.com") ||
        host.includes("images.unsplash.com")
      ) {
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
      return url; // otros proveedores
    } catch {
      return url;
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await getInmuebles(tipo);
        const arr =
          data?.values?.inmuebles ||
          data?.values?.inmueble ||
          data?.values ||
          [];
        setItems(Array.isArray(arr) ? arr : []);
      } catch (e) {
        setErr("No se pudo cargar el listado.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [tipo]);

  const openDetail = (id, it) => nav(`${basePath}/${id}`, { state: it });

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          {tipo ? `Inmuebles en ${tipo}` : "Inmuebles"}
        </h1>
        {/* Skeleton simple */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden">
              <div className="relative">
                <div className="pt-[56.25%] bg-stone-200 animate-pulse" />
              </div>
              <div className="p-5 bg-stone-50 space-y-2">
                <div className="h-4 bg-stone-200 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-stone-200 rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-stone-200 rounded w-1/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {tipo ? `Inmuebles en ${tipo}` : "Inmuebles"}
      </h1>

      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {err}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => {
          const raw =
            Array.isArray(it.fotos) && it.fotos[0]?.url
              ? it.fotos[0].url
              : null;
          const foto =
            normalizeUrl(raw) ||
            "https://images.unsplash.com/photo-1501183638710-841dd1904471";

          return (
            <div
              key={it.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border cursor-pointer"
              onClick={() => openDetail(it.id, it)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" ? openDetail(it.id, it) : null
              }
            >
              <div className="relative">
                {/* 16:9, cover y srcSet para nitidez */}
                <div className="pt-[56.25%]" />
                <img
                  src={tuned(foto, 800)}
                  srcSet={[
                    `${tuned(foto, 600)} 600w`,
                    `${tuned(foto, 800)} 800w`,
                    `${tuned(foto, 1200)} 1200w`,
                  ].join(", ")}
                  sizes="(min-width: 1280px) 400px, (min-width: 768px) 45vw, 100vw"
                  alt={it.titulo}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-5 bg-stone-50">
                <h3 className="font-semibold text-xl text-stone-900 leading-tight line-clamp-2">
                  {it.titulo}
                </h3>
                <p className="text-stone-600 mt-1 line-clamp-1">
                  {it.direccion}
                  {it.ciudad ? `, ${it.ciudad}` : ""}
                </p>
                <p className="mt-2 font-semibold text-blue-600">
                  Precio: {Number(it.precio || 0).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!items.length && !err && (
        <div className="mt-6 text-stone-500">No se encontraron inmuebles.</div>
      )}
    </div>
  );
}
