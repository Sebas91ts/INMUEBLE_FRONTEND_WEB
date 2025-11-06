import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function PaginaGestionContratos() {
  const navigate = useNavigate()

  // Estilo base para los botones (los hace ver como "tarjetas")
  const buttonStyle =
    'font-bold py-6 px-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 w-full max-w-lg text-left text-lg flex items-center'

  // Colores específicos
  const alquilerStyle = 'bg-emerald-600 hover:bg-emerald-700 text-white'
  const anticreticoStyle = 'bg-indigo-600 hover:bg-indigo-700 text-white'

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4'>
      <div className='bg-white p-10 rounded-xl shadow-2xl max-w-xl w-full'>
        
        {/* 1. TÍTULO Y TEXTO MEJORADOS (Contexto) */}
        <h1 className='text-3xl font-bold text-gray-800 text-center mb-4'>
          Contratos (Cliente Final)
        </h1>
        
        <p className='text-lg text-center text-gray-600 mb-12'>
          Administra los contratos firmados entre el <strong>dueño</strong> del
          inmueble y el <strong>cliente final</strong>.
        </p>

        <div className='flex flex-col items-center gap-8'>
          
          {/* 2. BOTÓN DE ALQUILER (Diseño Mejorado) */}
          <button
            onClick={() => navigate('/home/contratos-alquiler')}
            className={`${buttonStyle} ${alquilerStyle}`}
          >
            {/* Ícono */}
            <span className='text-4xl mr-5'>📄</span>
            {/* Texto */}
            <div>
              <span>Gestión de Contratos de Alquiler</span>
              <p className='text-sm font-normal opacity-90'>
                Para Arrendatarios y Propietarios
              </p>
            </div>
          </button>

          {/* 3. BOTÓN DE ANTICRÉTICO (Diseño Mejorado) */}
          <button
            onClick={() => navigate('/home/contratos-anticretico')}
            className={`${buttonStyle} ${anticreticoStyle}`}
          >
            {/* Ícono */}
            <span className='text-4xl mr-5'>🔑</span>
            {/* Texto */}
            <div>
              <span>Gestión de Contratos de Anticrético</span>
              <p className='text-sm font-normal opacity-90'>
                Para Anticresistas y Propietarios
              </p>
            </div>
          </button>

        </div>
      </div>
    </div>
  )
}