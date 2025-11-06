import { Link } from "react-router-dom";

export default function SeleccionTipoContrato() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-semibold mb-4">Seleccionar tipo de contrato</h2>
      <div className="flex justify-center gap-4">
        <Link
          to="venta"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Contrato de Servicio Venta
        </Link>
        <Link
          to="alquiler"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Contrato de Servicio Alquiler
        </Link>
        <Link
          to="anticretico"
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
        >
          Contrato de Servicio Anticrético
        </Link>
      </div>
    </div>
  );
}