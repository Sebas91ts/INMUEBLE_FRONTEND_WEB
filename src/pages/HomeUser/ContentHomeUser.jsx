import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Square,
  Search,
  Check,
  Loader2,
} from "lucide-react";

// 1. IMPORTAR API
import { getPlanes, iniciarPagoSuscripcion, getMiSuscripcion } from "../../api/suscripciones";
import { useAuth } from "../../hooks/useAuth"; 

export default function Home() {
  const [busquedaNLP, setBusquedaNLP] = useState("");
  const [planesBackend, setPlanesBackend] = useState([]);
  const [loadingPago, setLoadingPago] = useState(null); 
  
  // 2. ESTADO PARA GUARDAR TU SUSCRIPCIÓN ACTUAL
  const [miSuscripcion, setMiSuscripcion] = useState(null); 

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); 

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar Planes
        const resPlanes = await getPlanes();
        if (resPlanes.status === 1 && resPlanes.values && resPlanes.values.length > 0) {
          setPlanesBackend(resPlanes.values);
        }

        // 3. CARGAR MI SUSCRIPCIÓN (Solo si estoy logueado)
        if (isAuthenticated) {
            const resSub = await getMiSuscripcion();
            // Si status es 1 y hay valores, significa que tengo suscripción
            if (resSub.status === 1 && resSub.values) {
                setMiSuscripcion(resSub.values); 
                // resSub.values tendrá: { plan: 2, estado: 'activa', ... }
            }
        }

      } catch (error) {
        console.log("Error cargando datos iniciales");
      }
    };
    cargarDatos();
  }, [isAuthenticated]);

  const handleBusqueda = (e) => {
    e.preventDefault();
    if (busquedaNLP.trim()) {
      navigate(`/home/propiedades?busqueda=${encodeURIComponent(busquedaNLP)}`);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!plan.id_backend) {
       navigate("/home/registro/agente");
       return;
    }
    if (!isAuthenticated) {
      navigate("/login", { state: { plan_seleccionado: plan } });
      return;
    }
    try {
      setLoadingPago(plan.id_backend);
      const res = await iniciarPagoSuscripcion(plan.id_backend);
      if (res.status === 1 && res.values.url_checkout) {
        window.location.href = res.values.url_checkout;
      } else {
        alert("Error al iniciar el pago: " + (res.message || "Intente nuevamente"));
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con la pasarela de pagos.");
    } finally {
      setLoadingPago(null);
    }
  };

  // ... (featuredProperties se queda igual) ...
  const featuredProperties = [
    {
      idReal: null,
      title: "Villa Moderna en la Costa",
      location: "Marbella, España",
      price: "€2,500,000",
      beds: 4,
      baths: 3,
      area: "350 m²",
      image:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
    },
    {
      idReal: null,
      title: "Apartamento Céntrico de Lujo",
      location: "Madrid, España",
      price: "€850,000",
      beds: 3,
      baths: 2,
      area: "180 m²",
      image:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
    },
    {
      idReal: null,
      title: "Casa Colonial Restaurada",
      location: "Barcelona, España",
      price: "€1,200,000",
      beds: 5,
      baths: 4,
      area: "420 m²",
      image:
        "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop",
    },
  ];

  const planesAMostrar = planesBackend.length > 0
    ? planesBackend.map(p => ({
        id_backend: p.id,
        name: p.nombre,
        price: p.precio == 0 ? "Gratis" : `$${p.precio}`,
        frequency: "/mes",
        description: p.descripcion || "Plan ideal para empezar.",
        features: [
          `${p.limite_inmuebles} Propiedades`,
          p.permite_alertas ? "Alertas Automáticas ✅" : "Sin Alertas",
          p.permite_reportes ? "Reportes con IA ✅" : "Reportes Básicos",
          p.permite_destacados ? "Propiedades Destacadas" : "Visibilidad Estándar"
        ],
        cta: p.precio == 0 ? "Empezar Gratis" : "Suscribirse",
        isFeatured: p.nombre.toLowerCase().includes("pro") 
      }))
    : [ /* ... tus planes estáticos ... */ ];

  return (
    <div className="min-h-screen bg-stone-50">
      
      {/* Sección Hero */}
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(20, 20, 22, 0.6), rgba(20, 20, 22, 0.6)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        <div className="container mx-auto text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl text-balance">
            Tu nuevo hogar te espera
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-stone-200 sm:text-xl text-pretty">
            Usa nuestro buscador inteligente para describir la propiedad de tus sueños.
          </p>
          <div className="mx-auto max-w-3xl rounded-xl border border-stone-200 bg-white p-6 shadow-xl md:p-8">
            <form onSubmit={handleBusqueda} className="flex flex-col gap-4">
              <label
                htmlFor="search"
                className="text-left text-lg font-medium text-stone-800"
              >
                ¿Qué estás buscando?
              </label>
              <div className="relative flex w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Ej: 'Casa con 3 dormitorios que no pase de 50000 bs en Santa Cruz'"
                  className="w-full rounded-l-md border border-stone-300 bg-stone-50 py-4 pl-12 pr-4 text-lg text-stone-900 ring-0 transition placeholder:text-stone-500 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={busquedaNLP}
                  onChange={(e) => setBusquedaNLP(e.target.value)}
                />
                <button
                  type="submit"
                  className="rounded-r-md bg-orange-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  aria-label="Buscar propiedad"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/home/propiedades"
              className="inline-flex min-w-[220px] items-center justify-center rounded-md border border-transparent bg-orange-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-orange-500"
              aria-label="Explorar todas las propiedades"
            >
              Explorar Catálogo
            </Link>
            <Link
              to="/home/agentes-contacto"
              className="inline-flex min-w-[220px] items-center justify-center rounded-md border border-white/80 bg-white/20 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="Contactar un agente"
            >
              Hablar con un Agente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              Propiedades Destacadas
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              Selección exclusiva de nuestras mejores propiedades disponibles
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property, idx) => {
              const detailHref = property.idReal
                ? `/home/propiedades/${property.idReal}`
                : "/home/propiedades";
              const img = property.image || "/placeholder.svg";

              return (
                <div
                  key={property.idReal ?? idx}
                  className="overflow-hidden rounded-lg border border-stone-200 bg-white transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={img}
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-stone-900">
                        {property.title}
                      </h3>
                    </div>
                    <div className="mb-4 flex items-center gap-1 text-sm text-stone-600">
                      <MapPin className="h-4 w-4" />
                      <span>{property.location}</span>
                    </div>
                    <div className="mb-4 flex items-center gap-4 text-sm text-stone-600">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.beds}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.baths}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{property.area}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">
                        {property.price}
                      </span>
                      <Link
                        to={detailHref}
                        className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100 hover:text-stone-700"
                        aria-label={`Ver más sobre ${property.title}`}
                      >
                        Ver más
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/home/propiedades"
              className="inline-flex items-center justify-center rounded-md border border-stone-900 bg-transparent px-6 py-3 text-base font-medium text-stone-900 transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
              aria-label="Ver todas las propiedades"
            >
              Ver Todas las Propiedades
            </Link>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN DE PLANES --- */}
      <section className="py-20 px-4 bg-stone-50" id="planes">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              Planes para Agentes y Agencias
            </h2>
            
            {/* 4. MENSAJE SI YA TIENE PLAN */}
            {miSuscripcion && miSuscripcion.estado === 'activa' && (
                <div className="mt-4 inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-800">
                    Tu suscripción está activa hasta el {new Date(miSuscripcion.fecha_fin).toLocaleDateString()}
                </div>
            )}
          </div>

          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {planesAMostrar.map((plan, index) => {
              const esMiPlan = miSuscripcion && miSuscripcion.plan === plan.id_backend && miSuscripcion.estado === 'activa';

              return (
                <div
                  key={index}
                  className={`group relative flex flex-col rounded-lg border bg-white p-8 shadow-sm transition-all hover:shadow-lg ${
                    esMiPlan 
                        ? "border-2 border-green-500 ring-4 ring-green-50"
                        : plan.isFeatured
                            ? "border-2 border-orange-500"
                            : "border-stone-200 hover:border-orange-500"
                  }`}
                >
                  {/* ETIQUETA PLAN ACTUAL (Corregida para que no se corte) */}
                  {esMiPlan && (
                    <div className="mb-4 flex justify-center">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
                        Tu Plan Actual
                      </span>
                    </div>
                  )}
                  
                  {/* ETIQUETA POPULAR (Solo si no es mi plan) */}
                  {!esMiPlan && plan.isFeatured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                      <span className="rounded-full bg-orange-500 px-4 py-1 text-sm font-semibold text-white shadow-md">
                        Más Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-stone-900">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-stone-600">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-5xl font-bold text-stone-900">
                      {plan.price}
                    </span>
                    {plan.frequency && (
                      <span className="ml-1 text-lg text-stone-500">
                        {plan.frequency}
                      </span>
                    )}
                  </div>

                  <ul className="mb-8 space-y-3 text-stone-600">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className={`h-5 w-5 flex-shrink-0 ${esMiPlan ? 'text-green-500' : 'text-orange-500'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    {/* 6. LÓGICA DEL BOTÓN */}
                    {esMiPlan ? (
                        <button
                            disabled
                            className="inline-flex w-full items-center justify-center rounded-md bg-green-100 px-6 py-3 text-base font-semibold text-green-700 cursor-default"
                        >
                            Activo ✅
                        </button>
                    ) : (
                        // Botón normal de suscripción
                        plan.id_backend ? (
                            <button
                            onClick={() => handleSubscribe(plan)}
                            disabled={loadingPago === plan.id_backend}
                            className={`inline-flex w-full items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70 ${
                                plan.isFeatured
                                ? "bg-orange-600 text-white hover:bg-orange-500"
                                : "bg-white text-orange-600 border border-orange-600 hover:bg-orange-50 group-hover:bg-orange-600 group-hover:text-white"
                            }`}
                            >
                            {loadingPago === plan.id_backend ? (
                                <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                                </>
                            ) : (
                                plan.cta
                            )}
                            </button>
                        ) : (
                            <Link
                            to={plan.href}
                            className="inline-flex w-full items-center justify-center rounded-md border border-orange-600 bg-white px-6 py-3 text-base font-semibold text-orange-600 transition-colors hover:bg-orange-50"
                            >
                            {plan.cta}
                            </Link>
                        )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-stone-900 px-4 py-20 text-white">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl text-balance">
            ¿Listo para encontrar tu hogar ideal?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-stone-300 text-pretty">
            Nuestro equipo de expertos está aquí para ayudarte en cada paso del
            camino
          </p>
          <Link
            to="/home/agentes-contacto"
            className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-stone-900 transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
          >
            Agenda una Consulta
          </Link>
        </div>
      </section>
    </div>
  );
}