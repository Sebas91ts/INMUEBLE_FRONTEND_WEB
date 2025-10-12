const ContratosList = ({ onCreateContrato }) => {
  const contratos = [
    {
      id: 1,
      type: 'servicios-inmobiliarios',
      nombre: 'Contrato de Servicios Inmobiliarios',
      descripcion:
        'Contrato para la prestación de servicios inmobiliarios con clientes propietarios',
      icon: '🏠',
      color: 'blue'
    },
    {
      id: 2,
      type: 'agente',
      nombre: 'Contrato de Agente',
      descripcion: 'Contrato para agentes inmobiliarios',
      icon: '👨‍💼',
      color: 'green'
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
    return colors[color] || colors.blue
  }

  return (
    <div>
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-bold text-gray-800 mb-4'>
          Generador de Contratos
        </h1>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Selecciona el tipo de contrato que deseas generar. Completa el
          formulario y descarga tu documento en formato PDF.
        </p>
      </div>

      <div className='grid gap-8 md:grid-cols-2 max-w-4xl mx-auto'>
        {contratos.map((contrato) => (
          <div
            key={contrato.id}
            className={`bg-white rounded-2xl shadow-lg border-2 p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${getColorClasses(
              contrato.color
            )}`}
          >
            <div className='text-center'>
              <div className='text-4xl mb-4'>{contrato.icon}</div>
              <h2 className='text-2xl font-bold text-gray-800 mb-3'>
                {contrato.nombre}
              </h2>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                {contrato.descripcion}
              </p>

              <button
                onClick={() => onCreateContrato(contrato.type)}
                className='w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200'
              >
                Crear Contrato
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-12 text-center text-gray-500'>
        <p>¿Necesitas ayuda? Contacta con soporte técnico.</p>
      </div>
    </div>
  )
}

export default ContratosList
