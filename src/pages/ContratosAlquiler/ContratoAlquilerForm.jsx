// src/pages/ContratosAlquiler/ContratoAlquilerForm.jsx
// src/pages/ContratosAlquiler/ContratoAlquilerForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generarContratoAlquiler } from "../../api/contratos/alquiler";
import { FileText, ArrowLeft, Loader2 } from "lucide-react";
import instancia from "../../api/axios"; // para obtener inmuebles

export default function ContratoAlquilerForm() {
  const navigate = useNavigate();
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    inmueble_id: "",
    arrendatario_nombre: "",
    arrendatario_ci: "",
    arrendatario_domicilio: "",
    monto: "",
    garantia: "",
    vigencia_meses: "",
    fecha_inicio: "",
    fecha_fin: "",
    ciudad: "",
  });

  // 🔹 Cargar inmuebles disponibles
  useEffect(() => {
    const fetchInmuebles = async () => {
      try {
        const res = await instancia.get("/inmueble/listar_inmuebles");
        const data = res.data?.values?.inmuebles || [];
        const disponibles = data.filter(
          (i) => i.anuncio?.estado === "disponible"
        );
        setInmuebles(disponibles);
      } catch (error) {
        console.error("Error cargando inmuebles:", error);
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

    if (!formData.inmueble_id) {
      alert("Selecciona un inmueble antes de generar el contrato.");
      return;
    }

    setLoading(true);
    try {
      // ⚙️ Adaptar datos a lo que espera el backend
      const payload = {
        agente_id: 1, // 🔸 ID del agente logueado (ajusta si usas auth)
        inmueble_id: formData.inmueble_id,
        arrendatario_nombre: formData.arrendatario_nombre,
        arrendatario_ci: formData.arrendatario_ci,
        arrendatario_domicilio: formData.arrendatario_domicilio,
        monto_alquiler: formData.monto,
        monto_garantia: formData.garantia,
        vigencia_meses: formData.vigencia_meses,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        ciudad: formData.ciudad,
      };

      const res = await generarContratoAlquiler(payload);

      // ✅ 1. Verificar respuesta exitosa
      if (res.data?.status === 1 && res.data?.values?.pdf_url) {
        const pdfUrl = `http://127.0.0.1:8000${res.data.values.pdf_url}`;
        window.open(pdfUrl, "_blank"); // 🧾 abre el PDF directo desde backend
      } else {
        console.error("Respuesta inesperada:", res.data);
        alert("No se pudo generar el contrato correctamente.");
      }

      // 🔙 volver a lista de contratos
      navigate("/home/contratos-alquiler");
    } catch (error) {
      console.error("Error generando contrato:", error.response || error);
      alert(
        `Error: ${
          error.response?.data?.message ||
          "Ocurrió un error al generar el contrato."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Generar Contrato de Alquiler
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 🔹 Inmueble */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inmueble
            </label>
            <select
              name="inmueble_id"
              value={formData.inmueble_id}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="">Seleccionar inmueble...</option>
              {inmuebles.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.titulo} — {i.ciudad}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Datos del Arrendatario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Arrendatario
              </label>
              <input
                type="text"
                name="arrendatario_nombre"
                value={formData.arrendatario_nombre}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CI del Arrendatario
              </label>
              <input
                type="text"
                name="arrendatario_ci"
                value={formData.arrendatario_ci}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domicilio del Arrendatario
            </label>
            <input
              type="text"
              name="arrendatario_domicilio"
              value={formData.arrendatario_domicilio}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* 🔹 Datos del contrato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto de Alquiler (Bs)
              </label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                required
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Garantía (Bs)
              </label>
              <input
                type="number"
                name="garantia"
                value={formData.garantia}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* 🔹 Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vigencia (meses)
              </label>
              <input
                type="number"
                name="vigencia_meses"
                value={formData.vigencia_meses}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* 🔹 Ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* 🔘 Botón */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-70"
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
