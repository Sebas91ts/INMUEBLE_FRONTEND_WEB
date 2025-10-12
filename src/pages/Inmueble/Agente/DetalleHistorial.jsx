// src/pages/Inmueble/Agente/DetalleHistorial.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getInmuebleById } from "../../../api/inmueble";
import { solicitarCorreccionInmueble } from "../../../api/inmueble/historial";

export default function DetalleHistorial() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inmueble, setInmueble] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  // === Cargar datos del inmueble ===
  useEffect(() => {
    const fetchData = async () => {
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
        setErrMsg("Error al cargar los datos del inmueble.");
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
      } else {
        throw new Error(res.message);
      }
    } catch (e) {
      setErrMsg(e.message || "Error al reenviar la solicitud.");
    } finally {
      setSaving(false);
    }
  };

  // === Estados de carga ===
  if (loading) {
    return <div className="p-6 text-center text-gray-600">Cargando...</div>;
  }

  if (!inmueble) {
    return (
      <div className="p-6 text-center text-gray-600">
        No se encontró el inmueble.
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
  } = inmueble;

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* === Header === */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🏠 Detalle del Inmueble</h1>
        <button
          onClick={() => navigate("/home/mis-inmuebles/historial")}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          ← Volver al historial
        </button>
      </div>

      {/* === Mensajes === */}
      {okMsg && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
          {okMsg}
        </div>
      )}
      {errMsg && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded">{errMsg}</div>
      )}

      {/* === Galería de imágenes === */}
      {fotos && fotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {fotos.map((f, i) => (
            <img
              key={i}
              src={f.url || f.imagen || f}
              alt={`Foto ${i + 1}`}
              className="rounded-lg shadow-sm h-48 w-full object-cover"
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No hay imágenes disponibles.</p>
      )}

      {/* === Información general === */}
      <div className="border rounded-lg p-4 bg-white shadow-sm space-y-2">
        <h2 className="font-semibold text-lg">Información general</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p>
            <strong>Título:</strong> {titulo}
          </p>
          <p>
            <strong>Ciudad:</strong> {ciudad || "—"}
          </p>
          <p>
            <strong>Zona:</strong> {zona || "—"}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`${
                estado === "rechazado"
                  ? "text-red-700"
                  : estado === "aprobado"
                  ? "text-green-700"
                  : "text-yellow-700"
              } font-semibold`}
            >
              {estado || "—"}
            </span>
          </p>
          <p>
            <strong>Precio:</strong> Bs {precio || 0}
          </p>
          <p>
            <strong>Tipo operación:</strong> {tipo_operacion || "—"}
          </p>
        </div>
      </div>

      {/* === Descripción === */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="font-semibold text-lg mb-2">Descripción</h2>
        <p className="text-gray-700">{descripcion || "Sin descripción"}</p>
      </div>

      {/* === Motivo de rechazo === */}
      {estado === "rechazado" && motivo_rechazo && (
        <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-700 mb-1">
            Motivo del rechazo
          </h3>
          <p className="text-red-700 text-sm">{motivo_rechazo}</p>
        </div>
      )}

      {/* === Mapa === */}
      {latitud && longitud && (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <MapContainer
            center={[parseFloat(latitud), parseFloat(longitud)]}
            zoom={14}
            style={{ height: "300px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[parseFloat(latitud), parseFloat(longitud)]}>
              <Popup>{titulo}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {/* === Modo edición === */}
      {estado === "rechazado" && (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          {!modoEdicion ? (
            <button
              onClick={() => setModoEdicion(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              ✏️ Corregir y reenviar
            </button>
          ) : (
            <form className="space-y-4">
              <h2 className="font-semibold text-lg text-yellow-700">
                Corregir información
              </h2>

              {/* === Formulario completo === */}
              {[
                { label: "Título", name: "titulo" },
                { label: "Descripción", name: "descripcion", type: "textarea" },
                { label: "Ciudad", name: "ciudad" },
                { label: "Zona", name: "zona" },
                { label: "Precio (Bs)", name: "precio", type: "number" },
                { label: "Tipo de operación", name: "tipo_operacion" },
                { label: "Superficie (m²)", name: "superficie", type: "number" },
                { label: "Dormitorios", name: "dormitorios", type: "number" },
                { label: "Baños", name: "banos", type: "number" },
                { label: "Latitud", name: "latitud" },
                { label: "Longitud", name: "longitud" },
              ].map(({ label, name, type }) => (
                <label key={name} className="block">
                  <span className="text-sm">{label}</span>
                  {type === "textarea" ? (
                    <textarea
                      name={name}
                      rows="3"
                      value={form[name] || ""}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  ) : (
                    <input
                      type={type || "text"}
                      name={name}
                      value={form[name] || ""}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  )}
                </label>
              ))}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModoEdicion(false)}
                  className="border px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleReenviar}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
                >
                  {saving ? "Enviando..." : "Reenviar solicitud"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}



