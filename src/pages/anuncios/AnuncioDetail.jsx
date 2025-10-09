import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function AnuncioDetail() {
  const nav = useNavigate();
  const { state } = useLocation(); // inmueble completo desde la card
  const { id } = useParams();
  const d = state;

  if (!d) {
    return (
      <div className="p-6">
        <button className="mb-4 text-blue-600" onClick={() => nav(-1)}>
          ← Volver
        </button>
        <p>No hay datos del anuncio #{id}. Entra desde el listado.</p>
      </div>
    );
  }

  const fotos = Array.isArray(d.fotos)
    ? d.fotos.map((f) => f.url).filter(Boolean)
    : [];
  const hero = fotos[0] || null;

  return (
    <div className="p-0 md:p-6">
      <div className="bg-white md:rounded-2xl md:border overflow-hidden">
        {hero ? (
          <img src={hero} alt={d.titulo} className="w-full h-72 object-cover" />
        ) : (
          <div className="w-full h-72 bg-stone-200 grid place-items-center text-stone-500">
            Sin fotos
          </div>
        )}

        {fotos.length > 1 && (
          <div className="p-3 flex gap-2 overflow-auto bg-white border-b">
            {fotos.slice(1, 8).map((g, i) => (
              <img
                key={i}
                src={g}
                className="h-20 w-28 object-cover rounded-lg border"
              />
            ))}
          </div>
        )}

        <div className="p-5 bg-stone-50">
          <h1 className="text-2xl font-bold">{d.titulo}</h1>
          <p className="text-stone-600 mt-2">{d.descripcion || ""}</p>

          <div className="mt-4 space-y-1">
            <p>
              📍 {d.direccion}
              {d?.ciudad ? `, ${d.ciudad}` : ""}
            </p>
            {d?.zona && <p>🗺️ Zona: {d.zona}</p>}
            <p>💲 Precio: {Number(d?.precio || 0).toFixed(2)}</p>
            {d?.dormitorios != null && <p>🛏️ Dormitorios: {d.dormitorios}</p>}
            {d?.banos != null && <p>🛁 Baños: {d.banos}</p>}
          </div>

          <div className="mt-6">
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              onClick={() => alert("Contactar Agente")}
            >
              Contactar Agente
            </button>
            <button
              className="ml-2 px-4 py-2 rounded-lg bg-stone-200"
              onClick={() => nav(-1)}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
