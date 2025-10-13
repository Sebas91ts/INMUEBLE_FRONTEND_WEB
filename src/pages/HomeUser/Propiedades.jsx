// src/pages/HomeUser/Propiedades.jsx
import { useEffect, useState } from "react";
import { getInmuebles } from "../../api/inmueble/index";
import { Search, Filter, Loader2, AlertCircle } from "lucide-react";
import PropertyCard from "../../components/PropertyCard";

export default function Propiedades() {
  const [tipo, setTipo] = useState("");
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [ciudadFiltro, setCiudadFiltro] = useState("");

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

  const tiposOperacion = [
    { value: "", label: "Todas" },
    { value: "venta", label: "Venta" },
    { value: "alquiler", label: "Alquiler" },
    { value: "anticretico", label: "Anticrético" }
  ];

  // Obtener ciudades únicas
  const ciudadesUnicas = [...new Set(inmuebles.map(i => i.ciudad).filter(Boolean))];

  // Filtrar inmuebles por búsqueda y ciudad
  const inmueblesFiltrados = inmuebles.filter((inmueble) => {
    const matchBusqueda = inmueble.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          inmueble.direccion?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCiudad = !ciudadFiltro || inmueble.ciudad === ciudadFiltro;
    return matchBusqueda && matchCiudad;
  });

  const btnBase = "px-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-1 font-medium text-sm";
  const btnOn = "bg-stone-900 text-white border-stone-900";
  const btnOff = "hover:bg-stone-50 border-stone-300 text-stone-700";

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header Simple */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">
              Propiedades Disponibles
            </h1>
            <p className="text-stone-600 mt-1">
              {inmuebles.length} {inmuebles.length === 1 ? 'propiedad' : 'propiedades'}
            </p>
          </div>

          {/* Filtros por tipo */}
          <div className="flex flex-wrap gap-2">
            {tiposOperacion.map((op) => (
              <button
                key={op.value || "todas"}
                onClick={() => setTipo(op.value)}
                className={`${btnBase} ${tipo === op.value ? btnOn : btnOff}`}
              >
                {op.label}
              </button>
            ))}
          </div>

          {/* Buscador y filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por título o dirección..."
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            {ciudadesUnicas.length > 0 && (
              <div className="relative sm:w-56">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                  value={ciudadFiltro}
                  onChange={(e) => setCiudadFiltro(e.target.value)}
                >
                  <option value="">Todas las ciudades</option>
                  {ciudadesUnicas.map((ciudad) => (
                    <option key={ciudad} value={ciudad}>
                      {ciudad}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-stone-900 mb-4" />
            <p className="text-stone-600">Cargando propiedades...</p>
          </div>
        ) : inmueblesFiltrados.length ? (
          <>
            {/* Contador de resultados */}
            {(busqueda || ciudadFiltro) && (
              <div className="flex items-center justify-between px-1 py-2 border-b border-stone-200">
                <p className="text-sm text-stone-600">
                  {inmueblesFiltrados.length} {inmueblesFiltrados.length === 1 ? 'resultado' : 'resultados'}
                </p>
                <button
                  onClick={() => {
                    setBusqueda("");
                    setCiudadFiltro("");
                  }}
                  className="text-sm text-stone-900 hover:underline font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Grid de propiedades */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {inmueblesFiltrados.map((it) => (
                <PropertyCard
                  key={it.id}
                  image={it.fotos?.[0]?.url}
                  title={it.titulo}
                  location={`${it.direccion || ''}, ${it.ciudad || ''}`.trim().replace(/^,\s*/, '')}
                  price={it.precio}
                  beds={it.dormitorios}
                  baths={it.banos}
                  area={it.superficie}
                  to={`/home/propiedades/${it.id}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-900 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-stone-600 mb-6">
              {busqueda || ciudadFiltro
                ? "Intenta ajustar los filtros de búsqueda."
                : "No hay propiedades disponibles en este momento."}
            </p>
            {(busqueda || ciudadFiltro) && (
              <button
                onClick={() => {
                  setBusqueda("");
                  setCiudadFiltro("");
                }}
                className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}