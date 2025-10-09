// src/pages/Inmueble/AprobarInmuebles.jsx
import React, { useEffect, useState } from "react";
import {
  getSolicitudesInmuebles,
  aceptarInmueble,
  rechazarInmueble,
} from "../../api/inmueble/solicitud"; // ⬅️ usa el api unificado
import { useApi } from "../../hooks/useApi";
import ApprovalModal from "../../components/AprovalModal";
import ErrorModal from "../../components/ErrorModal";

const AprobarInmuebles = () => {
  const { execute: fetchInmuebles } = useApi(getSolicitudesInmuebles);
  const { execute: ejecutarAceptar } = useApi(aceptarInmueble);
  const { execute: ejecutarRechazar } = useApi(rechazarInmueble);

  const [inmuebles, setInmuebles] = useState([]);
  const [modal, setModal] = useState({ open: false, message: "" });
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchInmuebles();
        // res.data ya es array normalizado por el api
        setInmuebles(res?.data || []);
      } catch {
        setErrorModal({
          open: true,
          message: "Error al cargar inmuebles pendientes.",
        });
      }
    };
    load();
  }, [fetchInmuebles]);

  const handleAccion = async (id, tipo) => {
    try {
      const res = tipo === "aceptar"
        ? await ejecutarAceptar(id)
        : await ejecutarRechazar(id);

      const ok = res?.data?.status === 1 || res?.status === 200 || res?.status === 204;
      if (ok) {
        setInmuebles((prev) => prev.filter((i) => i.id !== id));
        setModal({
          open: true,
          message: `Inmueble ${tipo === "aceptar" ? "aprobado" : "rechazado"} correctamente.`,
        });
      } else {
        setErrorModal({ open: true, message: res?.data?.message || "No se pudo completar la acción." });
      }
    } catch (err) {
      setErrorModal({ open: true, message: "Error al procesar acción." });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Aprobación de Inmuebles
      </h1>

      {inmuebles.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No hay inmuebles pendientes.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {inmuebles.map((i) => (
            <div
              key={i.id}
              className="bg-white rounded-2xl shadow-md border p-5 hover:shadow-lg transition-all"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {i.titulo}
              </h2>
              <p className="text-sm text-gray-600"><strong>Ciudad:</strong> {i.ciudad}</p>
              <p className="text-sm text-gray-600"><strong>Zona:</strong> {i.zona}</p>
              <p className="text-sm text-gray-600"><strong>Precio:</strong> Bs {i.precio}</p>
              <p className="text-sm text-gray-600 mb-4"><strong>Agente:</strong> {i.agente_nombre || "—"}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAccion(i.id, "aceptar")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleAccion(i.id, "rechazar")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ApprovalModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, message: "" })}
        message={modal.message}
      />
      <ErrorModal
        isOpen={errorModal.open}
        onClose={() => setErrorModal({ open: false, message: "" })}
        message={errorModal.message}
      />
    </div>
  );
};

export default AprobarInmuebles;

