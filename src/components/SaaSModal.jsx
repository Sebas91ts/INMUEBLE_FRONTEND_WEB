import { X, Lock, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SaaSModal({ isOpen, onClose, title, message, actionLabel = "Ver Planes Premium" }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Encabezado decorativo */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-700 px-6 py-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
            <Lock className="h-8 w-8 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-white">{title || "Funcionalidad Premium"}</h3>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6 text-center">
          <p className="mb-6 text-stone-600 text-lg leading-relaxed">
            {message || "Esta función no está disponible en tu plan actual. Actualiza tu suscripción para desbloquearla."}
          </p>

          {/* Beneficios visuales (Psicología de venta) */}
          <div className="mb-6 space-y-2 text-left bg-stone-50 p-4 rounded-lg border border-stone-100">
            <div className="flex items-center gap-2 text-sm text-stone-700">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span>Desbloquea límites de propiedades</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-700">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span>Accede a reportes con IA</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-700">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span>Prioridad en soporte</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")} // Lleva a la sección de planes (Home)
              className="group inline-flex w-full items-center justify-center rounded-xl bg-orange-600 px-6 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-orange-500 hover:shadow-lg"
            >
              {actionLabel}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <button
              onClick={onClose}
              className="mt-2 text-sm font-medium text-stone-500 hover:text-stone-800"
            >
              Quizás más tarde
            </button>
          </div>
        </div>

        {/* Botón cerrar esquina */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/10 p-1 text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}