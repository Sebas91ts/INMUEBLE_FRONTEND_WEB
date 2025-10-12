// src/pages/Inmueble/Agente/HistorialPublicaciones.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisInmuebles, publicarInmueble } from "../../../api/inmueble";
import { BadgeCheck, Clock, XCircle } from "lucide-react";

export default function HistorialPublicaciones() {
  const navigate = useNavigate();
  const [inmuebles, setInmuebles] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const fetchInmuebles = async () => {
      try {
        const { data } = await getMisInmuebles(filtro);
        const lista = data?.values?.inmuebles || data?.values || [];
        setInmuebles(lista);
      } catch (err) {
        console.error(err);
        setErrMsg("Error al cargar el historial de publicaciones.");
      } finally {
        setLoading(false);
      }
    };
    fetchInmuebles();
  }, [filtro]);

  const handleVerDetalle = (id) => {
    navigate(`/home/mis-inmuebles/detalle/${id}`);
  };

  const handleCorregir = (id) => {
    navigate(`/home/mis-inmuebles/detalle/${id}?modo=editar`);
  };

  const handlePublicar = async (id) => {
    if (!confirm("¿Deseas publicar este inmueble?")) return;
    try {
      const res = await publicarInmueble(id);
      alert(res.message || "Inmueble publicado correctamente");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error al publicar el inmueble.");
    }
  };

  const filtrarBusqueda = (items) =>
    items.filter((i) =>
      i.titulo?.toLowerCase().includes(busqueda.toLowerCase())
    );

  const colorEstado = (estado) => {
    switch (estado) {
      case "aprobado":
        return "text-green-700 bg-green-100";
      case "rechazado":
        return "text-red-700 bg-red-100";
      case "pendiente":
        return "text-yellow-700 bg-yellow-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-500">Cargando historial...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🕓 Historial de Publicaciones
        </h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar inmueble..."
            className="border rounded px-3 py-1"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            className="border rounded px-3 py-1"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      {errMsg && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded">{errMsg}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="border px-3 py-2">#ID</th>
              <th className="border px-3 py-2">Título</th>
              <th className="border px-3 py-2">Ciudad</th>
              <th className="border px-3 py-2">Estado</th>
              <th className="border px-3 py-2">Publicación</th>
              <th className="border px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrarBusqueda(inmuebles).map((inmueble) => (
              <tr key={inmueble.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{inmueble.id}</td>
                <td className="border px-3 py-2">{inmueble.titulo}</td>
                <td className="border px-3 py-2">{inmueble.ciudad}</td>
                <td className="border px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${colorEstado(
                      inmueble.estado
                    )}`}
                  >
                    {inmueble.estado}
                  </span>
                </td>
                <td className="border px-3 py-2">
                  {inmueble.estado === "aprobado" ? (
                    <span className="text-green-600 font-medium">Publicado</span>
                  ) : (
                    <span className="text-gray-500">No publicado</span>
                  )}
                </td>
                <td className="border px-3 py-2 text-center space-x-2">
                  {inmueble.estado === "rechazado" && (
                    <button
                      onClick={() => handleCorregir(inmueble.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Corregir y reenviar
                    </button>
                  )}
                  <button
                    onClick={() => handleVerDetalle(inmueble.id)}
                    className="border border-gray-400 hover:bg-gray-100 px-3 py-1 rounded"
                  >
                    Ver detalle
                  </button>
                  {inmueble.estado === "aprobado" && (
                    <button
                      onClick={() => handlePublicar(inmueble.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Publicar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

