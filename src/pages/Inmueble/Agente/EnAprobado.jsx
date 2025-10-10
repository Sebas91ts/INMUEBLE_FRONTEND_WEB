import { useEffect, useState } from "react";
import { getInmuebles, publicarInmueble } from "../../../api/inmueble/index";
import { CheckCircle, Loader2 } from "lucide-react";

export default function EnAprobado() {
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publicando, setPublicando] = useState(null);

  // 🔹 Cargar inmuebles aprobados
  useEffect(() => {
    const loadInmuebles = async () => {
      setLoading(true);
      try {
        const { data } = await getInmuebles();
        const aprobados =
          data?.values?.inmuebles?.filter((i) => i.estado === "aprobado") || [];
        setInmuebles(aprobados);
      } catch (err) {
        console.error("❌ Error cargando inmuebles aprobados:", err);
        alert("Error al cargar los inmuebles aprobados.");
      } finally {
        setLoading(false);
      }
    };
    loadInmuebles();
  }, []);

  // 🔹 Publicar inmueble aprobado
  const handlePublicar = async (id) => {
    try {
      setPublicando(id);
      const res = await publicarInmueble(id);
      console.log("📦 Respuesta publicarInmueble:", res);

      // ✅ Validar respuesta del backend
      if (res?.status === 1 && !res?.error) {
        alert("✅ Inmueble publicado correctamente.");
        // Quitar inmueble de la lista
        setInmuebles((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert("⚠️ " + (res?.message || "No se pudo publicar el inmueble."));
      }
    } catch (err) {
      console.error("❌ Error al intentar publicar el inmueble:", err);
      alert("❌ Error al intentar publicar el inmueble.");
    } finally {
      setPublicando(null);
    }
  };

  // 🔹 UI
  if (loading)
    return <div className="p-6 text-gray-600">Cargando inmuebles aprobados...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        🏠 Mis Inmuebles Aprobados
      </h1>

      {inmuebles.length === 0 ? (
        <p className="text-gray-500">No tienes inmuebles aprobados aún.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {inmuebles.map((it) => (
            <div
              key={it.id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={it.fotos?.[0]?.url || "/placeholder.svg"}
                alt={it.titulo}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {it.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-1">{it.ciudad}</p>
                <p className="text-blue-600 font-bold text-sm mb-3">
                  Bs {Number(it.precio).toLocaleString()}
                </p>

                <button
                  onClick={() => handlePublicar(it.id)}
                  disabled={publicando === it.id}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-all ${
                    publicando === it.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {publicando === it.id ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" /> Publicando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" /> Publicar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

