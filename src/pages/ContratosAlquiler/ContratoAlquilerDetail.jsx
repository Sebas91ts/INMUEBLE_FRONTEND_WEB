// src/pages/ContratosAlquiler/ContratoAlquilerDetail.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerContratoAlquiler } from "../../api/contratos/alquiler";
import { ArrowLeft, FileDown, Loader2, FileText } from "lucide-react";

export default function ContratoAlquilerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const res = await obtenerContratoAlquiler(id);
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Error al cargar el contrato:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPdf();
  }, [id]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `Contrato_Alquiler_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Volver
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={!pdfUrl}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              <FileDown className="w-5 h-5" />
              Descargar PDF
            </button>
          </div>
        </div>

        {/* Título */}
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Contrato de Alquiler #{id}
          </h1>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">Cargando contrato...</p>
          </div>
        ) : pdfUrl ? (
          <div className="w-full h-[80vh] border rounded-lg overflow-hidden shadow-inner">
            <iframe
              src={pdfUrl}
              title={`Contrato ${id}`}
              width="100%"
              height="100%"
              className="rounded-lg"
            />
          </div>
        ) : (
          <div className="text-center py-20 text-gray-600">
            No se encontró el contrato solicitado.
          </div>
        )}
      </div>
    </div>
  );
}

