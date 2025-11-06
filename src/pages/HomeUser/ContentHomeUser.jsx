// src/pages/HomeUser/ContentHomeUser.jsx
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Square,
  Search,
  Check,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [busquedaNLP, setBusquedaNLP] = useState("");
  const navigate = useNavigate();

  const handleBusqueda = (e) => {
    e.preventDefault();
    if (busquedaNLP.trim()) {
      navigate(`/home/propiedades?busqueda=${encodeURIComponent(busquedaNLP)}`);
    }
  };

  const featuredProperties = [
    // ... (sin cambios)
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

  const pricingPlans = [
    // ... (sin cambios)
    {
      name: "Agente Individual",
      price: "$49",
      frequency: "/mes",
      description:
        "Perfecto para agentes que empiezan y quieren máxima visibilidad.",
      features: [
        "Hasta 10 propiedades listadas",
        "Dashboard de agente",
        "Soporte por email",
      ],
      cta: "Empezar Ahora",
      href: "/home/registro/agente",
      isFeatured: false,
    },
    {
      name: "Agencia Pro",
      price: "$199",
      frequency: "/mes",
      description: "La solución ideal para agencias en crecimiento.",
      features: [
        "Propiedades ilimitadas",
        "Dashboard de agencia (5 usuarios)",
        "Reportes avanzados",
        "Soporte prioritario 24/7",
      ],
      cta: "Elegir Plan Pro",
      href: "/home/registro/agencia-pro",
      isFeatured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      frequency: "",
      description:
        "Para grandes inmobiliarias con necesidades y volumen a medida.",
      features: [
        "Todo lo de Pro",
        "Integraciones API",
        "Gestor de cuenta dedicado",
        "Marca blanca",
      ],
      cta: "Contactar Ventas",
      href: "/home/agentes-contacto",
      isFeatured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Sección Hero (sin cambios) */}
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(20, 20, 22, 0.6), rgba(20, 20, 22, 0.6)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        {/* ... (contenido hero sin cambios) ... */}
        <div className="container mx-auto text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl text-balance">
            Tu nuevo hogar te espera
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-stone-200 sm:text-xl text-pretty">
            Usa nuestro buscador inteligente para describir la propiedad de tus
            sueños.
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

      {/* Featured Properties Section (sin cambios) */}
      <section className="py-20 px-4 bg-white">
        {/* ... (contenido de propiedades sin cambios) ... */}
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

      {/* --- SECCIÓN DE PLANES MODIFICADA --- */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              Planes para Agentes y Agencias
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              Elige la solución que mejor se adapta a tus necesidades para
              vender más rápido.
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                // --- 1. AÑADIDO 'group' Y 'hover:' AL BORDE ---
                className={`group relative flex flex-col overflow-hidden rounded-lg border bg-white p-8 shadow-sm transition-all hover:shadow-lg ${
                  plan.isFeatured
                    ? "border-2 border-orange-500" // El destacado lo mantiene por defecto
                    : "border-stone-200"
                } hover:border-2 hover:border-orange-500`} // Todas las cards lo ganan en hover
              >
                {plan.isFeatured && (
                  <div className="absolute top-0 -translate-y-1/2 rounded-full bg-orange-500 px-4 py-1 text-sm font-semibold text-white shadow-md left-1/2 -translate-x-1/2">
                    Más Popular
                  </div>
                )}

                <div className="mb-6">
                  {/* --- 2. AÑADIDO 'group-hover:' AL TÍTULO --- */}
                  <h3 className="text-2xl font-semibold text-stone-900 transition-colors group-hover:text-orange-600">
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
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-orange-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link
                    to={plan.href}
                    // --- 3. AÑADIDO 'group-hover:' AL BOTÓN (para los no-destacados) ---
                    className={`inline-flex w-full items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                      plan.isFeatured
                        ? "bg-orange-600 text-white hover:bg-orange-500" // Botón destacado
                        : "bg-white text-orange-600 border border-orange-600 hover:bg-orange-50 group-hover:bg-orange-600 group-hover:text-white" // Botón normal + efecto group-hover
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* --- FIN DE LA SECCIÓN MODIFICADA --- */}

      {/* CTA Section (sin cambios) */}
      <section className="bg-stone-900 px-4 py-20 text-white">
        {/* ... (contenido cta sin cambios) ... */}
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