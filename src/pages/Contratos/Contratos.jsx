import { useState } from 'react'
import ModalContratoAgente from './components/ModalCrearContratoAgente'

const Contratos = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedContrato, setSelectedContrato] = useState(null)

  // Lista de tipos de contrato
  const contratos = [
    {
      id: 1,
      nombre: 'Contrato Agente',
      descripcion: 'Contrato para agentes inmobiliarios'
    },
    {
      id: 2,
      nombre: 'Contrato Inmobiliaria',
      descripcion: 'Contrato con inmobiliaria'
    },
    {
      id: 3,
      nombre: 'Contrato Cliente',
      descripcion: 'Contrato de servicios con cliente'
    },
    {
      id: 4,
      nombre: 'Contrato Servicio Anticretico',
      descripcion: 'Contrato de servicios para anticréticos con cliente'
    }
  ]

  const handleDescargar = (contrato) => {
    setSelectedContrato(contrato)
    setModalOpen(true)
  }

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>Contratos</h1>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {contratos.map((c) => (
          <div
            key={c.id}
            className='bg-white rounded-2xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between'
          >
            <div>
              <h2 className='text-xl font-semibold text-gray-800 mb-2'>
                {c.nombre}
              </h2>
              <p className='text-gray-600 text-sm'>{c.descripcion}</p>
            </div>

            <button
              onClick={() => handleDescargar(c)}
              className='mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
            >
              Descargar
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <ModalContratoAgente
          onClose={() => setModalOpen(false)}
          contrato={selectedContrato}
        />
      )}
    </div>
  )
}

export default Contratos
