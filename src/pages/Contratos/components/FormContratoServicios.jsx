import { useState } from 'react'
import { descargarContratoServicios } from '../../../api/usuarios/usuarios'

const FormContratoServicios = ({ onBack }) => {
  const [formData, setFormData] = useState({
    ciudad: '',
    fecha: '',

    empresa_nombre: '',
    empresa_representante: '',
    empresa_ci: '',
    empresa_domicilio: '',

    cliente_nombre: '',
    cliente_ci: '',
    cliente_estado_civil: '',
    cliente_profesion: '',
    cliente_domicilio: '',

    agente_nombre: '',
    agente_ci: '',
    agente_estado_civil: '',
    agente_domicilio: '',

    inmueble_direccion: '',
    inmueble_superficie: '',
    inmueble_distrito: '',
    inmueble_manzana: '',
    inmueble_lote: '',
    inmueble_zona: '',
    inmueble_matricula: '',
    precio_inmueble: '',

    comision: '',
    vigencia_dias: '',

    direccion_oficina: '',
    telefono_oficina: '',
    email_oficina: ''
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
      const res = await descargarContratoServicios(formData)
      if (res?.data) {
        const blob = new Blob([res.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `contrato_servicios_${
          formData.cliente_nombre || 'cliente'
        }.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        setMessage('✅ Contrato generado y descargado con éxito.')
      } else {
        setMessage('❌ Error al generar contrato.')
      }
    } catch (err) {
      console.error('Error completo:', err)

      // Intentar leer el mensaje de error del backend
      if (err.response?.data) {
        // Si es un Blob, convertirlo a texto
        if (err.response.data instanceof Blob) {
          const errorText = await err.response.data.text()
          console.error('Error del backend:', errorText)
          try {
            const errorJson = JSON.parse(errorText)
            setMessage(`❌ ${errorJson.error || 'Error del servidor'}`)
          } catch {
            setMessage(`❌ Error: ${errorText}`)
          }
        } else {
          setMessage(`❌ ${err.response.data.error || 'Error del servidor'}`)
        }
      } else {
        setMessage('❌ Error de conexión.')
      }
    }
    setLoading(false)
  }

  const isFormValid = () => {
    return Object.values(formData).every((value) => value.trim() !== '')
  }

  const sections = [
    {
      title: '📋 Información General',
      fields: [
        { name: 'ciudad', label: 'Ciudad', type: 'text' },
        { name: 'fecha', label: 'Fecha', type: 'date' }
      ]
    },
    {
      title: '🏢 Información de la Empresa',
      fields: [
        { name: 'empresa_nombre', label: 'Nombre de la Empresa', type: 'text' },
        {
          name: 'empresa_representante',
          label: 'Representante Legal',
          type: 'text'
        },
        { name: 'empresa_ci', label: 'CI Representante', type: 'text' },
        { name: 'empresa_domicilio', label: 'Domicilio Empresa', type: 'text' }
      ]
    },
    {
      title: '👤 Información del Cliente',
      fields: [
        { name: 'cliente_nombre', label: 'Nombre Completo', type: 'text' },
        { name: 'cliente_ci', label: 'Cédula de Identidad', type: 'text' },
        { name: 'cliente_estado_civil', label: 'Estado Civil', type: 'text' },
        { name: 'cliente_profesion', label: 'Profesión', type: 'text' },
        { name: 'cliente_domicilio', label: 'Domicilio', type: 'text' }
      ]
    },
    {
      title: '👨‍💼 Información del Agente',
      fields: [
        { name: 'agente_nombre', label: 'Nombre del Agente', type: 'text' },
        { name: 'agente_ci', label: 'CI del Agente', type: 'text' },
        { name: 'agente_estado_civil', label: 'Estado Civil', type: 'text' },
        { name: 'agente_domicilio', label: 'Domicilio', type: 'text' }
      ]
    },
    {
      title: '🏠 Información del Inmueble',
      fields: [
        { name: 'inmueble_direccion', label: 'Dirección', type: 'text' },
        { name: 'inmueble_superficie', label: 'Superficie', type: 'text' },
        { name: 'inmueble_distrito', label: 'Distrito', type: 'text' },
        { name: 'inmueble_manzana', label: 'Manzana', type: 'text' },
        { name: 'inmueble_lote', label: 'Lote', type: 'text' },
        { name: 'inmueble_zona', label: 'Zona', type: 'text' },
        { name: 'inmueble_matricula', label: 'Matrícula', type: 'text' },
        { name: 'precio_inmueble', label: 'Precio del Inmueble', type: 'text' }
      ]
    },
    {
      title: '💰 Términos del Contrato',
      fields: [
        { name: 'comision', label: 'Comisión (%)', type: 'number' },
        { name: 'vigencia_dias', label: 'Vigencia (días)', type: 'number' }
      ]
    },
    {
      title: '📞 Información de Contacto',
      fields: [
        { name: 'direccion_oficina', label: 'Dirección Oficina', type: 'text' },
        { name: 'telefono_oficina', label: 'Teléfono', type: 'text' },
        { name: 'email_oficina', label: 'Email', type: 'email' }
      ]
    }
  ]

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Header */}
      <div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              Contrato de Servicios Inmobiliarios
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

      {/* Form */}
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

        {sections.map((section, index) => (
          <div key={section.title} className='mb-8'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
              {section.title}
            </h3>
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
            {index < sections.length - 1 && (
              <hr className='mt-6 border-gray-200' />
            )}
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
            {loading ? '⏳ Generando PDF...' : '📄 Generar Contrato PDF'}
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

export default FormContratoServicios
