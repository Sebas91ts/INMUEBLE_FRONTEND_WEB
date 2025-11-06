// src/pages/ContratosAlquiler/ContratoAlquilerList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Eye,
  Loader2,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  DollarSign,
} from "lucide-react";
import { listarContratosAlquiler } from "../../api/contratos/alquiler";

function ContratoAlquilerList() {
  const [contratos, setContratos] = useState([]);
  const [contratosFiltrados, setContratosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const navigate = useNavigate();

  // 🔹 Cargar contratos desde la API
  useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoading(true);
        const res = await listarContratosAlquiler();
        console.log("✅ Respuesta API contratos:", res);

        const data = res?.values?.contratos || [];
        setContratos(Array.isArray(data) ? data : []);
        setContratosFiltrados(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Error al cargar contratos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContratos();
  }, []);

  // 🔹 Filtros de búsqueda y estado
  useEffect(() => {
    let resultado = contratos;

    if (searchTerm) {
      resultado = resultado.filter(
        (c) =>
          c.inmueble?.titulo
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          c.inquilino?.nombre
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          c.ciudad?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtroEstado !== "todos") {
      resultado = resultado.filter((c) => c.estado === filtroEstado);
    }

    setContratosFiltrados(resultado);
  }, [searchTerm, filtroEstado, contratos]);

  // 🔹 Formato de fecha
  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 🧾 Header */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-2xl shadow-md">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                Contratos de Alquiler
              </h1>
              <p className="text-gray-500 font-medium">
                Gestiona todos tus contratos de alquiler registrados
              </p>
            </div>

            <button
              onClick={() => navigate("/home/contratos-alquiler/nuevo")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3.5 rounded-2xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all font-semibold transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" /> Nuevo Contrato
            </button>
          </div>
        </div>

        {/* 🔎 Barra de búsqueda y filtros */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por inmueble, inquilino o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer transition min-w-[200px] font-medium"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* 📋 Lista de contratos */}
        {loading ? (
          <div className="bg-white rounded-3xl p-20 shadow-lg border border-gray-100">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
              <p className="text-lg font-semibold">Cargando contratos...</p>
            </div>
          </div>
        ) : contratosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 shadow-lg border border-gray-100 text-center text-gray-600">
            <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-800 mb-2">
              No se encontraron contratos
            </p>
            <p className="text-gray-500 font-medium">
              {searchTerm || filtroEstado !== "todos"
                ? "Prueba cambiando los filtros de búsqueda"
                : "Comienza creando tu primer contrato de alquiler"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contratosFiltrados.map((c) => (
              <div
                key={c.id}
                className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* 🔹 Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-white truncate mb-1.5">
                        {c.inmueble?.titulo || "Sin título"}
                      </h2>
                      <div className="flex items-center gap-1.5 text-blue-50 text-sm">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <p className="truncate font-medium">
                          {c.inmueble?.direccion || "Sin dirección"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-md ${
                        c.estado === "activo"
                          ? "bg-emerald-400 text-emerald-900"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {c.estado?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* 🔹 Contenido */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-2.5 rounded-xl shadow-sm">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                          Monto mensual
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          Bs {c.monto?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-2.5 rounded-xl shadow-sm">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                          Inquilino
                        </p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {c.inquilino?.nombre || "Sin inquilino"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2.5 rounded-xl shadow-sm">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                          Fecha contrato
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatFecha(c.fecha_contrato)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 🔹 Botón único: Ver Contrato */}
                  <div className="pt-5 border-t-2 border-gray-100">
                    <button
                      onClick={() =>
                        navigate(`/home/contratos-alquiler/${c.id}`)
                      }
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <Eye className="w-5 h-5" />
                      Ver Contrato
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🔹 Resultados */}
        {!loading && contratosFiltrados.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 font-medium">
              Mostrando{" "}
              <span className="font-bold text-blue-600">
                {contratosFiltrados.length}
              </span>{" "}
              de <span className="font-bold">{contratos.length}</span> contratos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContratoAlquilerList;



