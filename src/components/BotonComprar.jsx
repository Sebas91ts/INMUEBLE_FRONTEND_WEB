// src/components/BotonComprar.jsx
import React, { useState } from "react";
import { crearOrdenStripe } from "../api/ventas/ventas.api";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";

export default function BotonComprar({ inmuebleId, onError, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleComprar = async () => {
    if (!inmuebleId) {
      setError("ID de inmueble no válido");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await crearOrdenStripe(inmuebleId);

      if (res.status === 1 && res.values?.checkout_url) {
    // 🔥 Guardamos venta_id ANTES de mandar al checkout
    sessionStorage.setItem("venta_id", res.values.venta_id);

    onSuccess?.(res);

    // Redirección a Stripe Checkout
    window.location.href = res.values.checkout_url;
}else {
        const errorMsg = res.message || "No se pudo crear la orden de compra";
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (error) {
      console.error("Error al crear orden:", error);
      const errorMsg = error.response?.data?.message || "Error al procesar el pago. Intenta nuevamente.";
      setError(errorMsg);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleComprar}
        disabled={loading || !inmuebleId}
        className="w-full py-4 px-6 rounded-xl bg-green-600 hover:bg-green-700 
                   active:bg-green-800 text-white font-bold flex items-center 
                   justify-center gap-2 transition-all duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-lg hover:shadow-xl transform hover:scale-[1.02]
                   active:scale-[0.98]"
        aria-label="Proceder con la compra del inmueble"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Comprar ahora</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg 
                        flex items-start gap-2 text-red-700 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}