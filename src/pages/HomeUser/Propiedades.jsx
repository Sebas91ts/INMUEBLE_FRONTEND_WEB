// src/pages/HomeUser/Propiedades.jsx - VERSIÓN ACTUALIZADA
import { useEffect, useState } from "react";
import { getInmuebles, buscarInmueblesNLP } from "../../api/inmueble/index"; // 👈 AÑADIR la nueva función
import { Search, Filter, Loader2, AlertCircle } from "lucide-react";
import PropertyCard from "../../components/PropertyCard";
import { useLocation } from "react-router-dom"; 

export default function Propiedades() {
  const [tipo, setTipo] = useState("");
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [ciudadFiltro, setCiudadFiltro] = useState("");
  const [modoNLP, setModoNLP] = useState(false); // 👈 NUEVO: para saber si estamos en búsqueda NLP
  const location = useLocation(); 

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const busquedaFromURL = urlParams.get('busqueda');
    
    if (busquedaFromURL) {
      setBusqueda(busquedaFromURL);
      // 👇 NUEVO: Si viene búsqueda de URL, hacer búsqueda NLP
      handleBusquedaNLP(busquedaFromURL);
    } else {
      // 👇 Si no hay búsqueda, cargar inmuebles normales
      cargarInmueblesNormales();
    }
  }, [location, tipo]); // 👈 Añadir tipo como dependencia

  // 👇 NUEVA FUNCIÓN: Cargar inmuebles normales
  const cargarInmueblesNormales = async () => {
    setLoading(true);
    setModoNLP(false);
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
  };

  // 👇 NUEVA FUNCIÓN: Búsqueda NLP
  const handleBusquedaNLP = async (query) => {
    if (!query.trim()) {
      cargarInmueblesNormales();
      return;
    }

    setLoading(true);
    setModoNLP(true);
    try {
      const data = await buscarInmueblesNLP(query);
      const anuncios = data.data.values.anuncios || [];
      
      // 👇 Transformar los datos del formato NLP al formato que espera tu componente
      const inmueblesTransformados = anuncios.map(anuncio => ({
        id: anuncio.inmueble,
        titulo: anuncio.inmueble_info.titulo,
        direccion: anuncio.inmueble_info.direccion,
        ciudad: anuncio.inmueble_info.ciudad,
        superficie: anuncio.inmueble_info.superficie,
        dormitorios: anuncio.inmueble_info.dormitorios,
        banos: anuncio.inmueble_info.baños,
        precio: anuncio.inmueble_info.precio,
        tipo_operacion: anuncio.inmueble_info.tipo_operacion,
        fotos: anuncio.inmueble_info.fotos || []
      }));

      setInmuebles(inmueblesTransformados);
    } catch (err) {
      console.error("Error en búsqueda NLP:", err);
      // Si falla NLP, cargar búsqueda normal
      cargarInmueblesNormales();
    } finally {
      setLoading(false);
    }
  };

  // 👇 ACTUALIZAR: Manejar cambio en el input de búsqueda
  const handleCambioBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    
    // Si se borra la búsqueda, volver a modo normal
    if (!valor.trim()) {
      cargarInmueblesNormales();
    }
  };

  // 👇 ACTUALIZAR: Filtrar inmuebles (solo en modo normal)
  const inmueblesFiltrados = modoNLP 
    ? inmuebles // En modo NLP, no aplicar filtros adicionales
    : inmuebles.filter((inmueble) => {
        const matchBusqueda = inmueble.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                              inmueble.direccion?.toLowerCase().includes(busqueda.toLowerCase());
        const matchCiudad = !ciudadFiltro || inmueble.ciudad === ciudadFiltro;
        return matchBusqueda && matchCiudad;
      });

  const tiposOperacion = [
    { value: "", label: "Todas" },
    { value: "venta", label: "Venta" },
    { value: "alquiler", label: "Alquiler" },
    { value: "anticretico", label: "Anticrético" }
  ];

  // Obtener ciudades únicas (solo en modo normal)
  const ciudadesUnicas = modoNLP 
    ? [] 
    : [...new Set(inmuebles.map(i => i.ciudad).filter(Boolean))];

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
              {modoNLP ? "Resultados de Búsqueda Inteligente" : "Propiedades Disponibles"}
            </h1>
            <p className="text-stone-600 mt-1">
              {inmueblesFiltrados.length} {inmueblesFiltrados.length === 1 ? 'propiedad' : 'propiedades'}
              {modoNLP && " encontradas"}
            </p>
            {modoNLP && (
              <p className="text-sm text-orange-600 mt-1">
                🔍 Búsqueda inteligente: "{busqueda}"
              </p>
            )}
          </div>

          {/* Filtros por tipo - OCULTAR en modo NLP */}
          {!modoNLP && (
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
          )}

          {/* Buscador y filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                placeholder={
                  modoNLP 
                    ? "Modifica tu búsqueda inteligente..." 
                    : "Buscar por título, dirección o usar búsqueda inteligente..."
                }
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                value={busqueda}
                onChange={handleCambioBusqueda}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBusquedaNLP(busqueda);
                  }
                }}
              />
            </div>
            
            {/* Select de ciudades - OCULTAR en modo NLP */}
            {!modoNLP && ciudadesUnicas.length > 0 && (
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
            
            {/* 👇 NUEVO: Botón para búsqueda NLP manual */}
            {!modoNLP && busqueda && (
              <button
                onClick={() => handleBusquedaNLP(busqueda)}
                className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Búsqueda Inteligente
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-stone-900 mb-4" />
            <p className="text-stone-600">
              {modoNLP ? "Analizando tu búsqueda..." : "Cargando propiedades..."}
            </p>
          </div>
        ) : inmueblesFiltrados.length ? (
          <>
            {/* Contador de resultados */}
            {(busqueda || ciudadFiltro) && !modoNLP && (
              <div className="flex items-center justify-between px-1 py-2 border-b border-stone-200">
                <p className="text-sm text-stone-600">
                  {inmueblesFiltrados.length} {inmueblesFiltrados.length === 1 ? 'resultado' : 'resultados'}
                </p>
                <button
                  onClick={() => {
                    setBusqueda("");
                    setCiudadFiltro("");
                    cargarInmueblesNormales();
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
              {modoNLP 
                ? "No encontramos propiedades que coincidan con tu búsqueda inteligente."
                : busqueda || ciudadFiltro
                  ? "Intenta ajustar los filtros de búsqueda."
                  : "No hay propiedades disponibles en este momento."
              }
            </p>
            <button
              onClick={() => {
                setBusqueda("");
                setCiudadFiltro("");
                setModoNLP(false);
                cargarInmueblesNormales();
              }}
              className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
            >
              Volver a todas las propiedades
            </button>
          </div>
        )}
      </div>
    </div>
  );
}