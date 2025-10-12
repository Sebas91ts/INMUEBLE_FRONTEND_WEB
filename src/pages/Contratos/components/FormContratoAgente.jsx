import { useState } from 'react'
import { descargarContratoAgente } from '../../../api/usuarios/usuarios'

const FormContratoAgente = ({ onBack }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
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
        setMessage('✅ Contrato generado con éxito.')
      } else {
        setMessage('❌ Error al generar contrato.')
      }
    } catch (err) {
      console.error(err)
      setMessage('❌ Error de conexión.')
    }
    setLoading(false)
  }

  const isFormValid = () => {
    return Object.values(formData).every((value) => value.trim() !== '')
  }

  const sections = [
    {
      title: '📋 Información general',
      fields: [
        { name: 'ciudad', label: 'Ciudad', type: 'text' },
        { name: 'fecha', label: 'Fecha', type: 'date' }
      ]
    },
    {
      title: '🏢 Inmobiliaria',
      fields: [
        {
          name: 'inmobiliaria_nombre',
          label: 'Nombre de la Inmobiliaria',
          type: 'text'
        },
        {
          name: 'inmobiliaria_direccion',
          label: 'Dirección de la Inmobiliaria',
          type: 'text'
        },
        {
          name: 'inmobiliaria_representante',
          label: 'Representante Legal',
          type: 'text'
        }
      ]
    },
    {
      title: '👨‍💼 Agente',
      fields: [
        { name: 'agente_nombre', label: 'Nombre del Agente', type: 'text' },
        {
          name: 'agente_direccion',
          label: 'Dirección del Agente',
          type: 'text'
        },
        { name: 'agente_ci', label: 'Cédula de Identidad', type: 'text' },
        { name: 'agente_licencia', label: 'Número de Licencia', type: 'text' }
      ]
    },
    {
      title: '💰 Términos del Contrato',
      fields: [
        { name: 'comision', label: 'Comisión (%)', type: 'number' },
        { name: 'duracion', label: 'Duración (meses)', type: 'number' }
      ]
    }
  ]

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              Contrato de Agente Inmobiliario
            </h1>
            <p className='text-gray-600'>
              Complete{' '}
              <span className='text-red-500 font-semibold'>
                todos los campos
              </span>{' '}
              para generar el contrato
            </p>
          </div>
          <button
            onClick={onBack}
            className='bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors'
          >
            ← Volver
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className='bg-white rounded-2xl shadow-lg p-6'
      >
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center ${
              message.includes('✅')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        {sections.map((section) => (
          <div key={section.title} className='mb-6'>
            <h4 className='text-lg font-semibold text-gray-700 mb-4'>
              {section.title}
            </h4>
            <div className='grid gap-4 md:grid-cols-2'>
              {section.fields.map((field) => (
                <div key={field.name} className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    {field.label} <span className='text-red-500'>*</span>
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder={`Ingrese ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className='flex justify-end gap-4 pt-6 border-t border-gray-200'>
          <button
            type='button'
            onClick={onBack}
            className='bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={loading || !isFormValid()}
            className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? '⏳ Generando...' : '📄 Generar PDF'}
          </button>
        </div>

        {!isFormValid() && (
          <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <p className='text-yellow-700 text-sm text-center'>
              ⚠️ Complete todos los campos para habilitar la generación del
              contrato
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default FormContratoAgente
