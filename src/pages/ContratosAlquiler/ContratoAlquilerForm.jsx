import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generarContratoAlquiler } from "../../api/contratos/alquiler";
import { FileText, ArrowLeft, Loader2, Home, User, FileDigit, Calendar, Shield, AlertTriangle, ChevronDown } from "lucide-react";
import instancia from "../../api/axios"; 
import { useAuth } from "../../hooks/useAuth";

// 1. IMPORTAR EL MODAL SAAS
import SaaSModal from "../../components/SaaSModal";

// --- Componentes de UI Reutilizables ---
const inputClass = "w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

const SelectInput = ({ label, children, ...props }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="relative">
      <select {...props} className={`${inputClass} appearance-none`}>
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);
const TextInput = ({ label, ...props }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input {...props} className={inputClass} />
  </div>
);
const DateInput = ({ label, ...props }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input type="date" {...props} className={`${inputClass} [color-scheme:light]`} />
  </div>
);

// --- Componente Principal ---
export default function ContratoAlquilerForm() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInmuebles, setLoadingInmuebles] = useState(true);
  const [error, setError] = useState("");

  // 2. ESTADO PARA EL MODAL SAAS
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const [formData, setFormData] = useState({
    inmueble_id: "",
    arrendatario_nombre: "",
    arrendatario_ci: "",
    arrendatario_domicilio: "",
    monto: "",
    garantia: "",
    vigencia_meses: "12",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    ciudad: "Santa Cruz",
  });

  useEffect(() => {
    const fetchInmuebles = async () => {
      setLoadingInmuebles(true);
      try {
        const res = await instancia.get("/inmueble/listar_inmuebles");
        const data = res.data?.values?.inmuebles || [];
        
        const disponibles = data.filter(
          (i) => i.anuncio?.estado === "disponible"
        );
        
        setInmuebles(disponibles);
      } catch (error) {
        console.error("Error cargando inmuebles:", error);
        setError("Error al cargar los inmuebles disponibles.");
      } finally {
        setLoadingInmuebles(false);
      }
    };
    fetchInmuebles();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

    if (!formData.inmueble_id) {
      setError("Selecciona un inmueble antes de generar el contrato.");
      return;
    }
    
    if (!user || !user.id) {
      setError("No se pudo identificar al agente. Por favor, vuelve a iniciar sesión.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        agente_id: user.id,
        inmueble_id: formData.inmueble_id,
        arrendatario_nombre: formData.arrendatario_nombre,
        arrendatario_ci: formData.arrendatario_ci,
        arrendatario_domicilio: formData.arrendatario_domicilio,
        monto_alquiler: formData.monto,
        monto_garantia: formData.garantia || "0", 
        vigencia_meses: formData.vigencia_meses,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        ciudad: formData.ciudad,
      };

      const res = await generarContratoAlquiler(payload);

      if (res.data?.status === 1 && res.data?.values?.pdf_url) {
        const pdfUrl = res.data.values.pdf_url;
        window.open(pdfUrl, "_blank");
        navigate("/home/contratos-alquiler"); 

      } else {
        console.error("Respuesta inesperada:", res.data);
        setError("No se pudo generar el contrato. La respuesta del servidor no fue válida.");
      }
    } catch (error) {
      console.error("Error generando contrato:", error.response || error);
      
      // 3. INTERCEPTAR ERROR SAAS (403)
      if (error.response && error.response.status === 403) {
          const msg = error.response.data?.error || error.response.data?.message || "Acceso denegado.";
          setUpgradeMessage(msg);
          setShowUpgradeModal(true); // <--- ABRIR MODAL
      } else {
          setError(
            error.response?.data?.message ||
            "Ocurrió un error al generar el contrato."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 relative">
      
      {/* 4. MODAL SAAS */}
      <SaaSModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        title="Función Premium"
        message={upgradeMessage}
        actionLabel="Actualizar Plan"
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          
          <div className="inline-flex items-center justify-center rounded-xl bg-blue-100 text-blue-700 p-2.5">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Generar Contrato de Alquiler
        </h1>

        {/* Formulario */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-6"
        >
          {/* --- Sección 1: Inmueble --- */}
          <fieldset>
            <legend className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
              <Home className="w-5 h-5 text-blue-600" />
              1. Inmueble
            </legend>
            <SelectInput
              label="Inmueble Disponible (para Alquiler)"
              name="inmueble_id"
              value={formData.inmueble_id}
              onChange={handleChange}
              required
              disabled={loadingInmuebles}
            >
              <option value="">{loadingInmuebles ? "Cargando..." : "Seleccionar inmueble..."}</option>
              {inmuebles.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.titulo} — {i.ciudad} (Bs. {i.precio})
                </option>
              ))}
            </SelectInput>
            {inmuebles.length === 0 && !loadingInmuebles && (
                <p className="text-xs text-red-600 mt-1.5">
                    No se encontraron inmuebles en alquiler disponibles.
                </p>
            )}
          </fieldset>

          {/* --- Sección 2: Arrendatario --- */}
          <fieldset>
            <legend className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
              <User className="w-5 h-5 text-blue-600" />
              2. Datos del Arrendatario (Inquilino)
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Nombre Completo"
                type="text"
                name="arrendatario_nombre"
                value={formData.arrendatario_nombre}
                onChange={handleChange}
                required
              />
              <TextInput
                label="Cédula de Identidad (CI)"
                type="text"
                name="arrendatario_ci"
                value={formData.arrendatario_ci}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mt-4">
              <TextInput
                label="Domicilio del Arrendatario"
                type="text"
                name="arrendatario_domicilio"
                value={formData.arrendatario_domicilio}
                onChange={handleChange}
                required
              />
            </div>
          </fieldset>
          
          {/* --- Sección 3: Condiciones --- */}
          <fieldset>
            <legend className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
              <FileDigit className="w-5 h-5 text-blue-600" />
              3. Condiciones del Contrato
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Monto de Alquiler (Bs)"
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                required
                min="1"
              />
              <TextInput
                label="Monto de Garantía (Bs)"
                type="number"
                name="garantia"
                value={formData.garantia}
                onChange={handleChange}
                min="0"
              />
            </div>
          </fieldset>

          {/* --- Sección 4: Vigencia --- */}
          <fieldset>
            <legend className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              4. Vigencia
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                label="Vigencia (meses)"
                type="number"
                name="vigencia_meses"
                value={formData.vigencia_meses}
                onChange={handleChange}
                required
              />
              <DateInput
                label="Fecha Inicio"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                required
              />
              <DateInput
                label="Fecha Fin"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                required
              />
            </div>
          </fieldset>

            <TextInput
              label="Ciudad (lugar de firma)"
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
            />

          {/* --- Error --- */}
          {error && (
             <div className="mt-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
             </div>
          )}

          {/* 🔘 Botón */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading || loadingInmuebles}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" /> Generar Contrato PDF
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}