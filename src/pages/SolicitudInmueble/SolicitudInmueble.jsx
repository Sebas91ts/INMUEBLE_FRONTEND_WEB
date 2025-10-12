// src/pages/SolicitudInmueble/SolicitudInmueble.jsx
import React, { useEffect, useState } from "react";
import {
  getSolicitudesInmuebles,
  cambiarEstadoInmueble,
} from "../../api/inmueble/solicitud";
import ApprovalModal from "../../components/AprovalModal";
import ErrorModal from "../../components/ErrorModal";
import { useApi } from "../../hooks/useApi";
import RejectModal from "../../components/RejectModal"; // ✅ Nuevo modal sin AntD

const SolicitudInmueble = () => {
  const {
    loading: loadingSolicitudes,
    error: errorSolicitudes,
    execute: fetchSolicitudes,
  } = useApi(getSolicitudesInmuebles);

  const { loading: loadingCambio, execute: ejecutarCambioEstado } =
    useApi(cambiarEstadoInmueble);

  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState("pendiente");
  const [busqueda, setBusqueda] = useState("");
  const [approvalModal, setApprovalModal] = useState({ open: false, message: "" });
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });

  // 🔹 Modal de rechazo
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedInmueble, setSelectedInmueble] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // =====================================================
  // 🔹 Cargar solicitudes según filtro
  // =====================================================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchSolicitudes(filtro);
        const inmuebles =
          Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.raw?.values?.inmuebles)
            ? res.raw.values.inmuebles
            : Array.isArray(res?.values?.inmuebles)
            ? res.values.inmuebles
            : [];

        setSolicitudes(inmuebles);
      } catch (err) {
        console.error("❌ Error cargando solicitudes:", err);
        setErrorModal({
          open: true,
          message: "Error al cargar solicitudes de inmuebles.",
        });
      }
    };
    load();
  }, [fetchSolicitudes, filtro]);

  // =====================================================
  // 🔹 Cambiar estado (Aprobar / Rechazar)
  // =====================================================
  const handleCambiarEstado = async (id, nuevoEstado, motivo = "") => {
    try {
      const res = await ejecutarCambioEstado(id, nuevoEstado, motivo);
      const ok =
        res?.data?.status === 1 || res?.status === 200 || res?.status === 204;
      if (ok) {
        setSolicitudes((prev) =>
          prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s))
        );
        setApprovalModal({
          open: true,
          message: `Inmueble ${nuevoEstado} correctamente.`,
        });
      } else {
        setErrorModal({
          open: true,
          message: res?.data?.message || "Error al cambiar el estado.",
        });
      }
    } catch (err) {
      setErrorModal({
        open: true,
        message: "Error al cambiar el estado: " + (err?.message || "desconocido"),
      });
    }
  };

  // =====================================================
  // 🔹 Modal de rechazo con motivo
  // =====================================================
  const abrirModalRechazo = (inmueble) => {
    setSelectedInmueble(inmueble);
    setMotivoRechazo("");
    setIsRejectModalOpen(true);
  };

  const confirmarRechazo = async () => {
    if (!motivoRechazo.trim()) {
      setErrorModal({ open: true, message: "Debes ingresar un motivo de rechazo." });
      return;
    }

    try {
      const res = await ejecutarCambioEstado(
        selectedInmueble.id,
        "rechazado",
        motivoRechazo
      );
      const ok =
        res?.data?.status === 1 || res?.status === 200 || res?.status === 204;

      if (ok) {
        setSolicitudes((prev) =>
          prev.filter((s) => s.id !== selectedInmueble.id)
        );
        setApprovalModal({
          open: true,
          message: `Inmueble rechazado correctamente.`,
        });
        setIsRejectModalOpen(false);
      } else {
        setErrorModal({
          open: true,
          message: res?.data?.message || "Error al rechazar inmueble.",
        });
      }
    } catch (err) {
      setErrorModal({
        open: true,
        message: "Error al rechazar inmueble: " + (err?.message || "desconocido"),
      });
    }
  };

  // =====================================================
  // 🔹 Filtro + búsqueda
  // =====================================================
  const solicitudesFiltradas = solicitudes.filter((s) => {
    const estado = (s.estado || "").toString().toLowerCase();
    const coincideEstado = filtro === "todos" || estado === filtro;
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      (s.titulo || "").toLowerCase().includes(q) ||
      (s.ciudad || "").toLowerCase().includes(q) ||
      (s.zona || "").toLowerCase().includes(q);
    return coincideEstado && coincideBusqueda;
  });

  // =====================================================
  // 🔹 Render
  // =====================================================
  if (loadingSolicitudes)
    return <p className="text-center text-gray-600">Cargando inmuebles...</p>;
  if (errorSolicitudes)
    return (
      <p className="text-red-500 text-center">
        Error al cargar solicitudes de inmuebles
      </p>
    );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Solicitudes de Inmuebles
      </h1>

      {/* 🔹 Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {["todos", "pendiente", "aprobado", "rechazado"].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                filtro === estado
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {estado === "todos"
                ? "Todos"
                : estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Buscar por título, ciudad o zona..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 🔹 Lista de inmuebles */}
      {solicitudesFiltradas.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No hay solicitudes que coincidan con los filtros.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solicitudesFiltradas.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all duration-200"
            >
              {/* Encabezado */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {s.titulo || "Inmueble sin título"}
                </h2>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    s.estado === "aprobado"
                      ? "bg-green-100 text-green-700"
                      : s.estado === "rechazado"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {s.estado || "pendiente"}
                </span>
              </div>

              {/* Datos */}
              <p className="text-sm text-gray-600">
                <strong>Tipo:</strong> {s.tipo_operacion}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Ciudad:</strong> {s.ciudad || "—"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Zona:</strong> {s.zona || "—"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Superficie:</strong> {s.superficie} m²
              </p>
              <p className="text-sm text-gray-600">
                <strong>Precio:</strong> {s.precio} Bs
              </p>

              {/* Fotos */}
              {s.fotos && s.fotos.length > 0 && (
                <div className="mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {s.fotos.slice(0, 4).map((foto, index) => (
                      <img
                        key={index}
                        src={foto.url}
                        alt={foto.descripcion || "Foto de inmueble"}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleCambiarEstado(s.id, "aprobado")}
                  disabled={s.estado === "aprobado" || loadingCambio}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                    s.estado === "aprobado"
                      ? "bg-green-800 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Aprobar
                </button>
                <button
                  onClick={() => abrirModalRechazo(s)}
                  disabled={s.estado === "rechazado" || loadingCambio}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                    s.estado === "rechazado"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 Modal de motivo de rechazo */}
      <RejectModal
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmarRechazo}
        titulo={selectedInmueble?.titulo}
        motivo={motivoRechazo}
        setMotivo={setMotivoRechazo}
      />

      {/* 🔹 Modales de éxito / error */}
      <ApprovalModal
        isOpen={approvalModal.open}
        onClose={() => setApprovalModal({ open: false, message: "" })}
        message={approvalModal.message}
      />
      <ErrorModal
        isOpen={errorModal.open}
        onClose={() => setErrorModal({ open: false, message: "" })}
        message={errorModal.message}
      />
    </div>
  );
};

export default SolicitudInmueble;
