import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Home } from "lucide-react";
import { confirmarPagoFrontend } from "../../api/suscripciones";

export default function SuccessPage() {
  const [estado, setEstado] = useState("procesando"); // procesando, exito, error

  useEffect(() => {
    const activarSuscripcion = async () => {
      try {
        // Llamamos al endpoint que confirma el pago (simulado o real)
        const res = await confirmarPagoFrontend();
        
        if (res.status === 1) {
          setEstado("exito");
        } else {
          setEstado("error");
        }
      } catch (error) {
        setEstado("error");
      }
    };

    // Pequeño delay para simular proceso y que se vea la UI
    setTimeout(() => activarSuscripcion(), 1500);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        
        {estado === "procesando" && (
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
            <h2 className="mt-6 text-2xl font-bold text-stone-900">Confirmando pago...</h2>
            <p className="mt-2 text-stone-600">Estamos activando tu plan Premium.</p>
          </div>
        )}

        {estado === "exito" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-stone-900">¡Pago Exitoso!</h2>
            <p className="mt-2 text-stone-600">
              Tu suscripción está activa. Ya puedes disfrutar de todas las funcionalidades PRO.
            </p>
            <div className="mt-8 w-full space-y-3">
              <Link
                to="/dashboard" // O a donde quieras enviarlos
                className="inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-5 py-3 text-base font-semibold text-white hover:bg-orange-500"
              >
                Ir a mi Dashboard
              </Link>
            </div>
          </div>
        )}

        {estado === "error" && (
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-red-100 p-3">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-stone-900">Algo salió mal</h2>
            <p className="mt-2 text-stone-600">
              No pudimos confirmar tu activación automáticamente. Por favor contacta a soporte.
            </p>
            <Link to="/home" className="mt-6 text-orange-600 hover:underline">
              Volver al inicio
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}