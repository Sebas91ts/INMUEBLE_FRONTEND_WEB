import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInmuebleById } from "../../api/inmueble/inmuebles";

// Función para ajustar la resolución/quality según proveedor
const tuned = (url, width = 1600, quality = 85) => {
  try {
    const u = new URL(url);
    const host = u.hostname;

    // Unsplash
    if (host.includes("unsplash.com") || host.includes("images.unsplash.com")) {
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("w", width);
      u.searchParams.set("q", quality);
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

    return url;
  } catch {
    return url;
  }
};

export default function PropiedadDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [inmueble, setInmueble] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getInmuebleById(id);
        const inm = data?.values?.inmueble ?? data?.values ?? data;
        setInmueble(inm);
      } catch (err) {
        console.error("Error cargando inmueble:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Cargando detalle…</div>;
  if (!inmueble)
    return (
      <div className="p-6">
        <button onClick={() => nav(-1)} className="text-blue-600 mb-4">
          ← Volver
        </button>
        <p>No se encontró el inmueble #{id}</p>
      </div>
    );

  const fotos = inmueble.fotos || [];

  return (
    <div className="container mx-auto p-6">
      <button onClick={() => nav(-1)} className="text-blue-600 mb-4">
        ← Volver
      </button>

      <div className="mb-6">
        {/* Foto principal con mayor resolución */}
        <div
          className="rounded-lg overflow-hidden mb-2 relative w-full"
          style={{ paddingTop: '56.25%' }}
        >
          <img
            src={tuned(fotos[currentPhoto]?.url, 1600)}
            alt={fotos[currentPhoto]?.descripcion || ''}
            className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300"
          />
        </div>

        {/* Miniaturas */}
        <div className="flex gap-2 overflow-x-auto">
          {fotos.map((f, idx) => (
            <img
              key={f.id}
              src={tuned(f.url, 400)} // miniaturas con resolución intermedia
              alt={f.descripcion}
              onClick={() => setCurrentPhoto(idx)}
              className={`h-20 w-32 object-cover rounded cursor-pointer border-2 transition-all duration-200
                ${currentPhoto === idx ? "border-blue-600 scale-105" : "border-gray-300"}`}
            />
          ))}
        </div>
      </div>

      {/* Info inmueble */}
      <div className="border rounded-lg p-6 shadow-lg bg-white">
        <h1 className="text-3xl font-bold mb-2">{inmueble.titulo}</h1>
        <p className="text-gray-700 mb-4">{inmueble.descripcion}</p>
        <p className="text-gray-500 mb-2">
          {inmueble.direccion}, {inmueble.ciudad}
        </p>
        <p className="text-blue-600 font-bold text-xl mb-2">
          ${Number(inmueble.precio).toLocaleString()}
        </p>
        <p className="text-gray-600 capitalize">
          Tipo de operación: {inmueble.tipo_operacion}
        </p>
        <p className="text-gray-600 capitalize">
          Tipo de inmueble: {inmueble.tipo_inmueble?.nombre}
        </p>
      </div>
    </div>
  );
}

