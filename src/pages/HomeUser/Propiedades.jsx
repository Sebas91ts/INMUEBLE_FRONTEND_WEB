// src/pages/HomeUser/Propiedades.jsx
import { useEffect, useState } from "react";
import { getInmuebles } from "../../api/inmueble/index";

import { useNavigate } from "react-router-dom";

export default function Propiedades() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState(""); // venta | alquiler | anticretico | ""
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getInmuebles(tipo);
        const { values: { inmuebles = [] } = {} } = data.data;
        setInmuebles(inmuebles);
      } catch (err) {
        console.error("Error cargando inmuebles:", err);
        setInmuebles([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [tipo]);

  const btnBase =
    "px-3 py-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1";
  const btnOn = "bg-blue-600 text-white border-blue-600";
  const btnOff = "hover:bg-stone-100 border-stone-300 text-stone-700";

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center gap-2">
        {["venta", "alquiler", "anticretico", ""].map((op) => (
          <button
            key={op || "todas"}
            onClick={() => setTipo(op)}
            className={`${btnBase} ${
              tipo === op ? btnOn : btnOff
            }`}
          >
            {op ? `En ${op}` : "Todas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Cargando inmuebles...</div>
      ) : inmuebles.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {inmuebles.map((it) => (
            <div
  key={it.id}
  className="bg-white rounded-2xl shadow border overflow-hidden cursor-pointer"
  onClick={() => navigate(`/home/propiedades/${it.id}`)}
>

              <img
                src={it.fotos?.[0]?.url}
                alt={it.titulo}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{it.titulo}</h3>
                <p className="text-gray-600 text-sm">
                  {it.direccion}, {it.ciudad}
                </p>
                <p className="text-blue-600 font-bold mt-2">
                  ${Number(it.precio).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 capitalize mt-1">
                  {it.tipo_operacion}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No se encontraron inmuebles.</p>
      )}
    </div>
  );
}