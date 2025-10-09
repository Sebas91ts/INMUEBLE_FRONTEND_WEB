import { useState } from 'react'
import { descargarContratoAgente } from '../../../api/usuarios/usuarios'

export default function ModalContratoAgente({ onClose }) {
  const [formData, setFormData] = useState({
    ciudad: '',
    fecha: '',
    inmobiliaria_nombre: '',
    inmobiliaria_direccion: '',
    inmobiliaria_representante: '',
    agente_nombre: '',
    agente_direccion: '',
    agente_ci: '',
    agente_licencia: '',
    comision: '',
    duracion: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await descargarContratoAgente(formData)
      if (res?.data) {
        const blob = new Blob([res.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `contrato_${formData.agente_nombre || 'agente'}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        setMessage('Contrato generado con éxito.')
      } else {
        setMessage('Error al generar contrato.')
      }
    } catch (err) {
      console.error(err)
      setMessage('Error de conexión.')
    }
    setLoading(false)
  }

  const getInputType = (key) => {
    if (key === 'fecha') return 'date'
    if (key === 'comision' || key === 'duracion') return 'number'
    return 'text'
  }

  const sections = [
    { title: 'Información general', fields: ['ciudad', 'fecha'] },
    {
      title: 'Inmobiliaria',
      fields: [
        'inmobiliaria_nombre',
        'inmobiliaria_direccion',
        'inmobiliaria_representante'
      ]
    },
    {
      title: 'Agente',
      fields: [
        'agente_nombre',
        'agente_direccion',
        'agente_ci',
        'agente_licencia'
      ]
    },
    {
      title: 'Contrato',
      fields: ['comision', 'duracion']
    }
  ]

  return (
    <div className='fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]'>
        <h3 className='text-2xl font-bold text-gray-800 mb-4'>
          Generar Contrato de Agente
        </h3>

        {message && (
          <p className='mb-4 text-center text-sm text-green-600'>{message}</p>
        )}

        {sections.map((section) => (
          <div key={section.title} className='mb-6'>
            <h4 className='text-lg font-semibold text-gray-700 mb-2'>
              {section.title}
            </h4>
            <div className='grid gap-3 md:grid-cols-2'>
              {section.fields.map((key) => (
                <input
                  key={key}
                  name={key}
                  type={getInputType(key)}
                  placeholder={key.replace(/_/g, ' ').toUpperCase()}
                  value={formData[key]}
                  onChange={handleChange}
                  className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
                />
              ))}
            </div>
          </div>
        ))}

        <div className='flex justify-end gap-3'>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Generando...' : 'Generar PDF'}
          </button>
          <button
            onClick={onClose}
            className='bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors'
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
