// src/components/RejectModal.jsx
import React from "react";

export default function RejectModal({
  open,
  onClose,
  onConfirm,
  titulo = "",
  motivo,
  setMotivo,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center 
      bg-gray-900/30 backdrop-blur-sm z-50 transition-all duration-300"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 
        border border-gray-200 animate-fadeIn"
      >
        {/* Título */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Rechazar inmueble
        </h2>
        {titulo && (
          <p className="text-sm text-gray-500 mb-4">
            <strong>Inmueble:</strong> {titulo}
          </p>
        )}

        {/* Campo de texto */}
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Escribe el motivo del rechazo:
        </label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 
          focus:ring-2 focus:ring-red-400 focus:outline-none text-sm resize-none"
          placeholder="Ejemplo: Faltan fotos del dormitorio principal..."
        ></textarea>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 
            bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white 
            bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );
}

