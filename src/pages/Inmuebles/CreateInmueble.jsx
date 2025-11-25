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
  Crown,
  ShieldCheck
} from "lucide-react";

// Importaciones de API y Hooks
import { getPlanes, iniciarPagoSuscripcion, getMiSuscripcion } from "../../api/suscripciones";
import { useAuth } from "../../hooks/useAuth"; 

export default function Home() {
  const [busquedaNLP, setBusquedaNLP] = useState("");
  const [planesBackend, setPlanesBackend] = useState([]);
  const [loadingPago, setLoadingPago] = useState(null); 
  
  // Estado de suscripción
  const [miSuscripcion, setMiSuscripcion] = useState(null); 

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); 

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resPlanes = await getPlanes();
        if (resPlanes.status === 1 && resPlanes.values && resPlanes.values.length > 0) {
          setPlanesBackend(resPlanes.values);
        }

        if (isAuthenticated) {
            const resSub = await getMiSuscripcion();
            if (resSub.status === 1 && resSub.values) {
                setMiSuscripcion(resSub.values); 
            }
        }
      } catch (error) {
        console.log("Usando planes por defecto (backend offline o vacío)");
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

  const featuredProperties = [
    {
      idReal: null,
      title: "Villa Moderna en la Costa",
      location: "Marbella, España",
      price: "€2,500,000",
      beds: 4,
      baths: 3,
      area: "350 m²",
      image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
    },
    {
      idReal: null,
      title: "Apartamento Céntrico",
      location: "Madrid, España",
      price: "€850,000",
      beds: 3,
      baths: 2,
      area: "180 m²",
      image: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
    },
    {
      idReal: null,
      title: "Casa Colonial Restaurada",
      location: "Barcelona, España",
      price: "€1,200,000",
      beds: 5,
      baths: 4,
      area: "420 m²",
      image: "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop",
    },
  ];

  // Mapeo de planes
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
          p.permite_destacados ? "Destacados ✅" : "Visibilidad Estándar"
        ],
        cta: p.precio == 0 ? "Empezar Gratis" : "Suscribirse",
        isFeatured: p.nombre.toLowerCase().includes("pro") 
      }))
    : [ 
        // Fallback estático (si el backend falla)
        { name: "Inicial", price: "Gratis", frequency: "/mes", description: "Para probar.", features: ["2 Propiedades", "Sin Alertas"], cta: "Empezar", isFeatured: false },
        { name: "Pro", price: "$49", frequency: "/mes", description: "Para agentes.", features: ["20 Propiedades", "Alertas ✅"], cta: "Suscribirse", isFeatured: true },
        { name: "Enterprise", price: "$199", frequency: "/mes", description: "Agencias grandes.", features: ["Ilimitado", "IA ✅"], cta: "Suscribirse", isFeatured: false },
      ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-stone-900 px-4 py-20">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" alt="Hero" className="h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>
          </div>
          
          <div className="container relative z-10 mx-auto text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl drop-shadow-lg">
              Encuentra tu lugar <span className="text-orange-500">ideal</span>
            </h1>
            
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md shadow-2xl mt-10">
                <form onSubmit={handleBusqueda} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Ej: Casa en el centro con 3 habitaciones..." 
                            className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500"
                            value={busquedaNLP}
                            onChange={(e) => setBusquedaNLP(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="rounded-xl bg-orange-600 px-8 py-4 font-bold text-white transition hover:bg-orange-500">
                        Buscar
                    </button>
                </form>
            </div>
          </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10">
             <div>
                <h2 className="text-3xl font-bold text-stone-900">Propiedades Destacadas</h2>
                <p className="text-stone-500 mt-2">Las mejores oportunidades del mercado seleccionadas para ti.</p>
             </div>
             <Link to="/home/propiedades" className="hidden md:flex items-center text-orange-600 font-semibold hover:text-orange-700">
                Ver todas <ArrowRight className="ml-1 h-4 w-4" />
             </Link>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {featuredProperties.map((property, idx) => (
                <div key={idx} className="group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100">
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={property.image} alt={property.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <span className="text-2xl font-bold text-white">{property.price}</span>
                        </div>
                    </div>
                    <div className="p-5">
                        <h3 className="text-lg font-bold text-stone-900 line-clamp-1">{property.title}</h3>
                        <div className="flex items-center text-stone-500 text-sm mt-2 mb-4">
                            <MapPin className="h-4 w-4 mr-1" /> {property.location}
                        </div>
                        <div className="flex justify-between border-t border-stone-100 pt-4 text-sm font-medium text-stone-600">
                            <span className="flex items-center gap-1"><Bed className="h-4 w-4 text-orange-500"/> {property.beds}</span>
                            <span className="flex items-center gap-1"><Bath className="h-4 w-4 text-orange-500"/> {property.baths}</span>
                            <span className="flex items-center gap-1"><Square className="h-4 w-4 text-orange-500"/> {property.area}</span>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN DE PLANES MEJORADA --- */}
      <section className="py-20 px-4 bg-white" id="planes">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600 uppercase tracking-wider">
                Suscripciones
            </span>
            <h2 className="mt-3 text-4xl font-bold text-stone-900 sm:text-5xl">
              Planes Flexibles
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-500">
              Potencia tu negocio inmobiliario con herramientas profesionales.
            </p>

            {/* INFO DE SUSCRIPCIÓN ACTUAL */}
            {miSuscripcion && miSuscripcion.estado === 'activa' && (
                <div className="mx-auto mt-8 max-w-md rounded-xl bg-green-50 p-4 border border-green-100 flex items-center justify-center gap-3 shadow-sm">
                    <div className="p-2 bg-green-100 rounded-full">
                        <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-green-800">Suscripción Activa</p>
                        <p className="text-xs text-green-600">Vence el {new Date(miSuscripcion.fecha_fin).toLocaleDateString()}</p>
                    </div>
                </div>
            )}
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {planesAMostrar.map((plan, index) => {
              const esMiPlan = miSuscripcion && miSuscripcion.plan === plan.id_backend && miSuscripcion.estado === 'activa';

              return (
                <div
                  key={index}
                  className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                    esMiPlan 
                        ? "bg-white border-2 border-green-500 shadow-2xl scale-105 z-10"
                        : plan.isFeatured
                            ? "bg-stone-900 text-white shadow-xl scale-105 z-10 ring-1 ring-stone-900"
                            : "bg-white border border-stone-200 hover:shadow-lg hover:border-stone-300"
                  }`}
                >
                  {/* ETIQUETA PLAN ACTUAL */}
                  {esMiPlan && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wide">
                        Tu Plan Actual
                      </span>
                    </div>
                  )}

                  {/* ETIQUETA POPULAR (Si no es mi plan) */}
                  {!esMiPlan && plan.isFeatured && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wide flex items-center gap-1">
                        <Crown className="h-3 w-3" /> Más Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6 mt-4">
                    <h3 className={`text-xl font-bold ${plan.isFeatured && !esMiPlan ? 'text-white' : 'text-stone-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`mt-2 text-sm ${plan.isFeatured && !esMiPlan ? 'text-stone-400' : 'text-stone-500'}`}>
                        {plan.description}
                    </p>
                  </div>

                  <div className="mb-6 flex items-baseline">
                    <span className={`text-5xl font-extrabold ${plan.isFeatured && !esMiPlan ? 'text-white' : 'text-stone-900'}`}>
                      {plan.price}
                    </span>
                    {plan.frequency && (
                      <span className={`ml-1 text-sm font-medium ${plan.isFeatured && !esMiPlan ? 'text-stone-400' : 'text-stone-500'}`}>
                        {plan.frequency}
                      </span>
                    )}
                  </div>

                  <ul className="mb-8 space-y-4 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-0.5 ${esMiPlan ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                        <span className={`text-sm font-medium ${plan.isFeatured && !esMiPlan ? 'text-stone-300' : 'text-stone-600'}`}>
                            {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    {esMiPlan ? (
                        <button disabled className="w-full rounded-xl bg-green-50 py-3 text-sm font-bold text-green-600 border border-green-200 cursor-default">
                            Plan Activo ✅
                        </button>
                    ) : (
                        <button
                            onClick={() => handleSubscribe(plan)}
                            disabled={loadingPago === plan.id_backend}
                            className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
                                plan.isFeatured
                                    ? "bg-white text-stone-900 hover:bg-stone-100"
                                    : "bg-stone-900 text-white hover:bg-stone-800"
                            } disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {loadingPago === plan.id_backend ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Procesando...
                                </span>
                            ) : (
                                plan.cta
                            )}
                        </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-stone-900 text-white py-16 px-4 mt-10 rounded-t-3xl mx-4 md:mx-8">
        <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
            <p className="text-stone-400 mb-8">Únete a la plataforma inmobiliaria más innovadora del mercado.</p>
            <Link to="/home/agentes-contacto" className="inline-block bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105">
                Contactar Soporte
            </Link>
        </div>
      </section>
    </div>
  );
}