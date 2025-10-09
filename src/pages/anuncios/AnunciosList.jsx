import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAnunciosDisponibles } from "/../api/inmueble/anuncios";
import AnuncioCard from "./components/AnuncioCard";

export default function AnunciosList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAnunciosDisponibles();
        // el backend responde { status, values: { inmueble: [...] } }
        setItems(data?.values?.inmueble || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Cargando anuncios…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Anuncios disponibles</h1>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => (
          <AnuncioCard
            key={it.id}
            data={it}
            onClick={() => nav(`/dashboard/anuncios/${it.id}`, { state: it })}
          />
        ))}
      </div>
    </div>
  );
}
