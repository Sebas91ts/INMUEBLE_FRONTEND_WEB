// src/pages/Inmueble/Agente/DetalleHistorial.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getInmuebleById } from "../../../api/inmueble";
import { solicitarCorreccionInmueble } from "../../../api/inmueble/historial";
import {
  ArrowLeft,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Save,
  X,
  ImageIcon,
  FileText,
} from "lucide-react";

export default function DetalleHistorial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [inmueble, setInmueble] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(searchParams.get("modo") === "editar");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);

  // === Cargar datos del inmueble ===
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await getInmuebleById(id);
        const inmuebleData = data?.values?.inmueble || data?.values || data;

        setInmueble(inmuebleData);
        setForm({
          titulo: inmuebleData?.titulo || "",
          descripcion: inmuebleData?.descripcion || "",
          ciudad: inmuebleData?.ciudad || "",
          zona: inmuebleData?.zona || "",
          precio: inmuebleData?.precio || 0,
          latitud: inmuebleData?.latitud || "",
          longitud: inmuebleData?.longitud || "",
          superficie: inmuebleData?.superficie || "",
          dormitorios: inmuebleData?.dormitorios || "",
          banos: inmuebleData?.banos || "",
          tipo_operacion: inmuebleData?.tipo_operacion || "",
        });
      } catch (e) {
        console.error("Error cargando inmueble:", e);
        setErrMsg("Error al cargar los datos del inmueble. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // === Handlers ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReenviar = async () => {
    if (!form.titulo.trim()) {
      setErrMsg("El título no puede estar vacío.");
      return;
    }

    setSaving(true);
    setOkMsg("");
    setErrMsg("");

    try {
      const res = await solicitarCorreccionInmueble(id, form);
      if (res.status === 1) {
        setOkMsg(res.message || "Solicitud reenviada correctamente.");
        setModoEdicion(false);
        // Actualizar los datos del inmueble
        const { data } = await getInmuebleById(id);
        const inmuebleData = data?.values?.inmueble || data?.values || data;
        setInmueble(inmuebleData);
      } else {
        throw new Error(res.message);
      }
    } catch (e) {
      setErrMsg(e.message || "Error al reenviar la solicitud.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelarEdicion = () => {
    setModoEdicion(false);
    setOkMsg("");
    setErrMsg("");
    // Restaurar valores originales
    if (inmueble) {
      setForm({
        titulo: inmueble?.titulo || "",
        descripcion: inmueble?.descripcion || "",
        ciudad: inmueble?.ciudad || "",
        zona: inmueble?.zona || "",
        precio: inmueble?.precio || 0,
        latitud: inmueble?.latitud || "",
        longitud: inmueble?.longitud || "",
        superficie: inmueble?.superficie || "",
        dormitorios: inmueble?.dormitorios || "",
        banos: inmueble?.banos || "",
        tipo_operacion: inmueble?.tipo_operacion || "",
      });
    }
  };

  // === Configuración de estados ===
  const estadoConfig = {
    aprobado: {
      color: "text-green-700 bg-green-50 border-green-200",
      icon: CheckCircle,
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

  // === Estados de carga ===
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Cargando detalles del inmueble...</p>
        </div>
      </div>
    );
  }

  if (!inmueble) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900">
            No se encontró el inmueble
          </h3>
          <button
            onClick={() => navigate("/home/mis-inmuebles/historial")}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al historial
          </button>
        </div>
      </div>
    );
  }

  // === Datos del inmueble ===
  const {
    titulo,
    descripcion,
    ciudad,
    zona,
    estado,
    fotos,
    latitud,
    longitud,
    precio,
    tipo_operacion,
    motivo_rechazo,
    superficie,
    dormitorios,
    banos,
  } = inmueble;

  const config = estadoConfig[estado] || estadoConfig.pendiente;
  const IconoEstado = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* === Header === */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <button
                onClick={() => navigate("/home/mis-inmuebles/historial")}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al historial
              </button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Home className="w-8 h-8 text-blue-600" />
                {titulo}
              </h1>
            </div>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${config.color}`}
            >
              <IconoEstado className="w-4 h-4" />
              {config.label}
            </span>
          </div>

          {/* Características principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Precio</p>
                <p className="font-semibold text-gray-900">
                  Bs {precio?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            {superficie && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Maximize className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Superficie</p>
                  <p className="font-semibold text-gray-900">{superficie} m²</p>
                </div>
              </div>
            )}
            {dormitorios && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Bed className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Dormitorios</p>
                  <p className="font-semibold text-gray-900">{dormitorios}</p>
                </div>
              </div>
            )}
            {banos && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Bath className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="text-xs text-gray-500">Baños</p>
                  <p className="font-semibold text-gray-900">{banos}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === Mensajes === */}
        {okMsg && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Éxito</p>
              <p className="text-green-700 text-sm">{okMsg}</p>
            </div>
          </div>
        )}
        {errMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-red-700 text-sm">{errMsg}</p>
            </div>
          </div>
        )}

        {/* === Motivo de rechazo === */}
        {estado === "rechazado" && motivo_rechazo && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 text-lg mb-2">
                  Motivo del rechazo
                </h3>
                <p className="text-red-700">{motivo_rechazo}</p>
                {!modoEdicion && (
                  <button
                    onClick={() => setModoEdicion(true)}
                    className="mt-4 inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Corregir y reenviar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === Galería de imágenes === */}
        {fotos && fotos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Galería de imágenes
            </h2>
            <div className="space-y-4">
              {/* Imagen principal */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={fotos[imagenSeleccionada]?.url || fotos[imagenSeleccionada]?.imagen || fotos[imagenSeleccionada]}
                  alt={`Foto ${imagenSeleccionada + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {imagenSeleccionada + 1} / {fotos.length}
                </div>
              </div>
              {/* Miniaturas */}
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {fotos.map((foto, i) => (
                  <button
                    key={i}
                    onClick={() => setImagenSeleccionada(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      i === imagenSeleccionada
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={foto.url || foto.imagen || foto}
                      alt={`Miniatura ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === Modo edición === */}
        {modoEdicion ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-yellow-700">
              <Edit className="w-5 h-5" />
              Corregir información
            </h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Título */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={form.titulo || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ej: Casa en venta zona Norte"
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    rows="4"
                    value={form.descripcion || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Describe las características del inmueble..."
                  />
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={form.ciudad || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Zona */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona
                  </label>
                  <input
                    type="text"
                    name="zona"
                    value={form.zona || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (Bs)
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={form.precio || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>

                {/* Tipo de operación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de operación
                  </label>
                  <select
                    name="tipo_operacion"
                    value={form.tipo_operacion || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar</option>
                    <option value="venta">Venta</option>
                    <option value="alquiler">Alquiler</option>
                    <option value="anticrético">Anticrético</option>
                  </select>
                </div>

                {/* Superficie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Superficie (m²)
                  </label>
                  <input
                    type="number"
                    name="superficie"
                    value={form.superficie || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>

                {/* Dormitorios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dormitorios
                  </label>
                  <input
                    type="number"
                    name="dormitorios"
                    value={form.dormitorios || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>

                {/* Baños */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baños
                  </label>
                  <input
                    type="number"
                    name="banos"
                    value={form.banos || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>

                {/* Latitud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitud
                  </label>
                  <input
                    type="text"
                    name="latitud"
                    value={form.latitud || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="-17.7833"
                  />
                </div>

                {/* Longitud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud
                  </label>
                  <input
                    type="text"
                    name="longitud"
                    value={form.longitud || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="-63.1821"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancelarEdicion}
                  className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-lg transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleReenviar}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg transition-colors font-medium flex-1 md:flex-initial justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Reenviar solicitud
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* === Información general === */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Información general
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium text-gray-900">
                      {ciudad && zona ? `${ciudad}, ${zona}` : ciudad || zona || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo de operación</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {tipo_operacion || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* === Descripción === */}
            {descripcion && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {descripcion}
                </p>
              </div>
            )}

            {/* === Mapa === */}
            {latitud && longitud && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Ubicación en el mapa
                </h2>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <MapContainer
                    center={[parseFloat(latitud), parseFloat(longitud)]}
                    zoom={15}
                    style={{ height: "400px", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[parseFloat(latitud), parseFloat(longitud)]}>
                      <Popup>{titulo}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Coordenadas: {latitud}, {longitud}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


