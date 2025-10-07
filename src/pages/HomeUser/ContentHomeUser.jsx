import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Bed, Bath, Square } from 'lucide-react'

export default function Home() {
  const featuredProperties = [
    {
      id: 1,
      title: 'Villa Moderna en la Costa',
      location: 'Marbella, España',
      price: '€2,500,000',
      beds: 4,
      baths: 3,
      area: '350 m²'
    },
    {
      id: 2,
      title: 'Apartamento Céntrico de Lujo',
      location: 'Madrid, España',
      price: '€850,000',
      beds: 3,
      baths: 2,
      area: '180 m²'
    },
    {
      id: 3,
      title: 'Casa Colonial Restaurada',
      location: 'Barcelona, España',
      price: '€1,200,000',
      beds: 5,
      baths: 4,
      area: '420 m²'
    }
  ]

  return (
    <div className='min-h-screen bg-stone-50'>
      {/* Hero Section */}
      <section className='relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-stone-100 px-4 py-20'>
        <div className='container mx-auto text-center'>
          <h1 className='mb-6 text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl md:text-7xl lg:text-8xl text-balance'>
            Encuentra tu hogar perfecto
          </h1>
          <p className='mx-auto mb-8 max-w-2xl text-lg text-stone-600 sm:text-xl text-pretty'>
            Descubre propiedades exclusivas en las mejores ubicaciones. Tu
            próximo hogar te está esperando.
          </p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link
              to='/propiedades'
              className='inline-flex min-w-[200px] items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2'
            >
              Ver Propiedades
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
            <Link
              to='/contacto'
              className='inline-flex min-w-[200px] items-center justify-center rounded-md border border-stone-900 bg-transparent px-6 py-3 text-base font-medium text-stone-900 transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2'
            >
              Contactar Agente
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className='py-20 px-4 bg-white'>
        <div className='container mx-auto'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl'>
              Propiedades Destacadas
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-stone-600'>
              Selección exclusiva de nuestras mejores propiedades disponibles
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className='overflow-hidden rounded-lg border border-stone-200 bg-white transition-all hover:shadow-lg'
              >
                <div className='relative aspect-[4/3] overflow-hidden'>
                  <img
                    src={property.image || '/placeholder.svg'}
                    alt={property.title}
                    className='h-full w-full object-cover transition-transform hover:scale-105'
                  />
                </div>
                <div className='p-6'>
                  <div className='mb-2 flex items-start justify-between'>
                    <h3 className='text-xl font-semibold text-stone-900'>
                      {property.title}
                    </h3>
                  </div>
                  <div className='mb-4 flex items-center gap-1 text-sm text-stone-600'>
                    <MapPin className='h-4 w-4' />
                    <span>{property.location}</span>
                  </div>
                  <div className='mb-4 flex items-center gap-4 text-sm text-stone-600'>
                    <div className='flex items-center gap-1'>
                      <Bed className='h-4 w-4' />
                      <span>{property.beds}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Bath className='h-4 w-4' />
                      <span>{property.baths}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Square className='h-4 w-4' />
                      <span>{property.area}</span>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-2xl font-bold text-orange-600'>
                      {property.price}
                    </span>
                    <Link
                      to={`/propiedades/${property.id}`}
                      className='inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100 hover:text-stone-700'
                    >
                      Ver más
                      <ArrowRight className='ml-2 h-4 w-4' />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-12 text-center'>
            <Link
              to='/propiedades'
              className='inline-flex items-center justify-center rounded-md border border-stone-900 bg-transparent px-6 py-3 text-base font-medium text-stone-900 transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2'
            >
              Ver Todas las Propiedades
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-stone-900 px-4 py-20 text-white'>
        <div className='container mx-auto text-center'>
          <h2 className='mb-4 text-4xl font-bold tracking-tight sm:text-5xl text-balance'>
            ¿Listo para encontrar tu hogar ideal?
          </h2>
          <p className='mx-auto mb-8 max-w-2xl text-lg text-stone-300 text-pretty'>
            Nuestro equipo de expertos está aquí para ayudarte en cada paso del
            camino
          </p>
          <Link
            to='/contacto'
            className='inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-stone-900 transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900'
          >
            Agenda una Consulta
          </Link>
        </div>
      </section>
    </div>
  )
}
