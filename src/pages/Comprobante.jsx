import { useEffect, useState } from "react";
import axios from "axios";

export default function Comprobante() {
  const [venta, setVenta] = useState(null);
  const token = localStorage.getItem("access_token");
  const ventaId = sessionStorage.getItem("venta_id");

  useEffect(() => {
    if (!token || !ventaId) return;

    axios.get(`https://inmobiliaria-backend-qqwv.onrender.com/ventas/detalle/${ventaId}/`, {
      headers: { Authorization: `Token ${token}` },
    })
    .then((res) => setVenta(res.data.values))
    .catch((err) => console.error(err));
  }, []);

  const descargarPDF = () => {
    window.print(); 
  };

  if (!venta)
    return (
      <p className="text-center mt-10 text-lg">
        Cargando comprobante...
      </p>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-2xl w-full">
        
        <h1 className="text-3xl font-bold text-green-700 text-center mb-6">
          🧾 Comprobante de Compra
        </h1>

        {/* Datos principales */}
        <div className="mb-6">
          <p><b>N° Operación:</b> {venta.id}</p>
          <p><b>Fecha:</b> {new Date(venta.fecha).toLocaleString()}</p>
          <p><b>Método de pago:</b> {venta.metodo_pago}</p>
          <p><b>Transacción Stripe:</b> {venta.transaccion_id}</p>
        </div>

        {/* Inmueble */}
        <div className="border rounded-xl p-4 mb-6 flex gap-4">
          {venta.inmueble.foto_portada && (
            <img
              src={venta.inmueble.foto_portada}
              className="w-32 h-32 object-cover rounded-lg"
            />
          )}
          <div>
            <p className="text-xl font-semibold">{venta.inmueble.titulo}</p>
            <p className="text-gray-600">{venta.inmueble.direccion}</p>
            <p className="text-lg font-bold mt-2">{venta.monto} BOB</p>
          </div>
        </div>

        {/* Comprador */}
        <div className="mb-6">
          <h2 className="text-lg font-bold">Datos del comprador</h2>
          <p>{venta.comprador.nombre}</p>
          <p>{venta.comprador.correo}</p>
          <p>CI: {venta.comprador.ci}</p>
        </div>

        {/* Botón PDF */}
        <div className="text-center mt-8">
          <button
            onClick={descargarPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Descargar PDF
          </button>
        </div>

      </div>
    </div>
  );
}
