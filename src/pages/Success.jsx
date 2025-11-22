// src/pages/Success.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function Success() {
  const [venta, setVenta] = useState(null);

  const token =
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token");

  console.log("token:", token);
  // Obtener venta_id desde URL
  const params = new URLSearchParams(window.location.search);
  const ventaId = params.get("venta_id");
  console.log("ventaId:", ventaId);
  useEffect(() => {
    if (!token || !ventaId) return;

    axios.get(`http://localhost:8000/ventas/detalle/${ventaId}/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => setVenta(res.data.values))
      .catch((err) => console.error("Error al cargar venta:", err));
  }, [token, ventaId]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 text-center max-w-lg">

        <div className="text-6xl mb-4">🏡</div>

        <h1 className="text-3xl font-bold text-green-700 mb-3">
          ¡Compra realizada con éxito!
        </h1>

        <p className="text-gray-700 text-lg">
          Gracias por confiar en nosotros.
        </p>

        <p className="text-gray-700 text-lg mb-6">
          Tu compra ha sido registrada correctamente.
        </p>

        {venta && (
          <div className="bg-gray-50 p-5 rounded-xl shadow-inner mb-6 text-left">
            <p className="text-gray-800"><b>Inmueble:</b> {venta.inmueble?.titulo}</p>
            <p className="text-gray-800"><b>Monto:</b> {venta.monto} BOB</p>
            <p className="text-gray-800">
              <b>Fecha:</b> {new Date(venta.fecha).toLocaleString("es-BO")}
            </p>
          </div>
        )}

        {/* BOTÓN DESCARGAR PDF */}
        {ventaId && token && (
          <a
            href={`http://localhost:8000/ventas/comprobante/${ventaId}/?token=${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-4"
          >
            📄 Descargar comprobante en PDF
          </a>
        )}

        <a
          href="/home"
          className="inline-block bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
