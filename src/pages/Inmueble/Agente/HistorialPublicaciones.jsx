// src/pages/Inmueble/Agente/HistorialPublicaciones.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisInmuebles, publicarInmueble } from "../../../api/inmueble";
import {
  BadgeCheck,
  Clock,
  XCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  AlertCircle,
} from "lucide-react";

export default function HistorialPublicaciones() {
  const navigate = useNavigate();
  const [inmuebles, setInmuebles] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    fetchInmuebles();
  }, [filtro]);

  const fetchInmuebles = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const { data } = await getMisInmuebles(filtro);
      const lista = data?.values?.inmuebles || data?.values || [];
      setInmuebles(lista);
    } catch (err) {
      console.error(err);
      setErrMsg(
        "Error al cargar el historial de publicaciones. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (id) => {
    navigate(`/home/mis-inmuebles/detalle/${id}`);
  };

  const handleCorregir = (id) => {
    navigate(`/home/mis-inmuebles/detalle/${id}?modo=editar`);
  };

  const handlePublicar = async (id) => {
    if (!confirm("¿Estás seguro de que deseas publicar este inmueble?")) return;

    setProcesando(id);
    try {
      const res = await publicarInmueble(id);
      alert(res.message || "Inmueble publicado correctamente");
      await fetchInmuebles();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Error al publicar el inmueble. Por favor, intenta nuevamente."
      );
    } finally {
      setProcesando(null);
    }
  };

  const filtrarBusqueda = (items) =>
    items.filter(
      (i) =>
        i.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        i.ciudad?.toLowerCase().includes(busqueda.toLowerCase())
    );

  const estadoConfig = {
    aprobado: {
      color: "text-green-700 bg-green-50 border-green-200",
      icon: BadgeCheck,
      label: "Aprobado",
    },
    rechazado: {
      color: "text-red-700 bg-red-50 border-red-200",
      icon: XCircle,
      label: "Rechazado",
    },
    pendiente: {
      color: "text-yellow-700 bg-yellow-50 border-yellow-200",
      icon: Clock,
      label: "Pendiente",
    },
  };

  const getEstadoConfig = (estado) =>
    estadoConfig[estado] || {
      color: "text-gray-700 bg-gray-50 border-gray-200",
      icon: AlertCircle,
      label: estado,
    };

  const inmueblesFiltrados = filtrarBusqueda(inmuebles);
  const estadisticas = {
    total: inmuebles.length,
    aprobados: inmuebles.filter((i) => i.estado === "aprobado").length,
    pendientes: inmuebles.filter((i) => i.estado === "pendiente").length,
    rechazados: inmuebles.filter((i) => i.estado === "rechazado").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-blue-600" />
            Historial de Publicaciones
          </h1>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-900">
                {estadisticas.total}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600 font-medium">Aprobados</p>
              <p className="text-2xl font-bold text-green-900">
                {estadisticas.aprobados}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">
                {estadisticas.pendientes}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-red-600 font-medium">Rechazados</p>
              <p className="text-2xl font-bold text-red-900">
                {estadisticas.rechazados}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título o ciudad..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer min-w-[160px]"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mensajes de error */}
        {errMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-red-700 text-sm">{errMsg}</p>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {inmueblesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron inmuebles
              </h3>
              <p className="text-gray-500">
                {busqueda
                  ? "Intenta con otros términos de búsqueda"
                  : "Aún no tienes inmuebles registrados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inmueble
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ciudad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Publicación
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inmueblesFiltrados.map((inmueble) => {
                    const config = getEstadoConfig(inmueble.estado);
                    const IconoEstado = config.icon;

                    return (
                      <tr
                        key={inmueble.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{inmueble.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{inmueble.titulo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {inmueble.ciudad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
                          >
                            <IconoEstado className="w-3.5 h-3.5" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {inmueble.publicado ? (
                            <span className="flex items-center gap-1.5 text-green-600 font-medium">
                              <BadgeCheck className="w-4 h-4" />
                              Publicado
                            </span>
                          ) : (
                            <span className="text-gray-500">No publicado</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex items-center justify-center gap-2">
                            {inmueble.estado === "rechazado" && (
                              <button
                                onClick={() => handleCorregir(inmueble.id)}
                                className="inline-flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                              >
                                <Edit className="w-4 h-4" />
                                Corregir
                              </button>
                            )}
                            <button
                              onClick={() => handleVerDetalle(inmueble.id)}
                              className="inline-flex items-center gap-1.5 border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </button>
                            {inmueble.estado === "aprobado" && !inmueble.publicado && (
                              <button
                                onClick={() => handlePublicar(inmueble.id)}
                                disabled={procesando === inmueble.id}
                                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                              >
                                {procesando === inmueble.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Publicando...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    Publicar
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        {inmueblesFiltrados.length > 0 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            Mostrando {inmueblesFiltrados.length} de {inmuebles.length}{" "}
            inmuebles registrados.
          </div>
        )}
      </div>
    </div>
  );
}
