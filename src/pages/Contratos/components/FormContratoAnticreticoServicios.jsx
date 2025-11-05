import { useState, useEffect } from 'react'
import { descargarContratoServiciosAnticretico } from '../../../api/contratos/servicio_anticretico'
import { getInmueblesNoPublicadosTipoOperacion } from '../../../api/inmueble'
import { getAgentes } from '../../../api/usuarios/usuarios'
import { useAuth } from '../../../hooks/useAuth'
import { PrinterIcon } from 'lucide-react'

const FormContratoServicios = ({ onBack }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    // Campos básicos
    ciudad: '',
    fecha: new Date().toISOString().split('T')[0],

    // Información de la empresa
    empresa_nombre: '',
    empresa_representante: '',
    empresa_ci: '',
    empresa_domicilio: '',

    // Información del cliente
    cliente_nombre: '',
    cliente_ci: '',
    cliente_estado_civil: '',
    cliente_profesion: '',
    cliente_domicilio: '',

    // Información del agente (se llena automáticamente o manualmente)
    agente_id: user?.grupo_nombre === 'agente' ? user.id : '',
    agente_nombre: user?.grupo_nombre === 'agente' ? user.nombre : '',
    agente_ci: user?.grupo_nombre === 'agente' ? user.ci : '',
    agente_estado_civil: '',
    agente_domicilio: '',

    // Información del inmueble (seleccionable)
    inmueble_id: '',
    inmueble_direccion: '',
    inmueble_superficie: '',
    inmueble_distrito: '',
    inmueble_manzana: '',
    inmueble_lote: '',
    inmueble_zona: '',
    inmueble_matricula: '',
    precio_inmueble: '',

    // Términos del contrato
    comision: '',
    vigencia_dias: '',

    // Información de contacto
    direccion_oficina: '',
    telefono_oficina: '',
    email_oficina: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [inmuebles, setInmuebles] = useState([])
  const [agentes, setAgentes] = useState([])
  const [loadingInmuebles, setLoadingInmuebles] = useState(false)
  const [loadingAgentes, setLoadingAgentes] = useState(false)

  // Cargar inmuebles no publicados
  useEffect(() => {
    const cargarInmuebles = async () => {
      setLoadingInmuebles(true)
      try {
        const response = await getInmueblesNoPublicadosTipoOperacion("venta")
        console.log('Inmuebles no publicados para venta:', response.data)
        setInmuebles(response.data.values?.inmuebles || [])
      } catch (error) {
        console.error('Error al cargar inmuebles:', error)
        setMessage('❌ Error al cargar la lista de inmuebles')
      } finally {
        setLoadingInmuebles(false)
      }
    }

    cargarInmuebles()
  }, [])

  // Cargar agentes si el usuario no es agente
  useEffect(() => {
    if (user?.grupo_nombre !== 'agente') {
      const cargarAgentes = async () => {
        setLoadingAgentes(true)
        try {
          const response = await getAgentes()
          setAgentes(response.data.values || [])
        } catch (error) {
          console.error('Error al cargar agentes:', error)
          setMessage('❌ Error al cargar la lista de agentes')
        } finally {
          setLoadingAgentes(false)
        }
      }

      cargarAgentes()
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar selección de inmueble
  const handleInmuebleChange = (inmuebleId) => {
    const inmuebleSeleccionado = inmuebles.find(
      (i) => i.id === parseInt(inmuebleId)
    )
    if (inmuebleSeleccionado) {
      setFormData((prev) => ({
        ...prev,
        inmueble_id: inmuebleSeleccionado.id,
        inmueble_direccion: inmuebleSeleccionado.direccion || '',
        inmueble_superficie: inmuebleSeleccionado.superficie || '',
        inmueble_distrito: inmuebleSeleccionado.distrito || '',
        inmueble_manzana: inmuebleSeleccionado.manzana || '',
        inmueble_lote: inmuebleSeleccionado.lote || '',
        inmueble_zona: inmuebleSeleccionado.zona || '',
        inmueble_matricula: inmuebleSeleccionado.matricula || '',
        precio_inmueble: inmuebleSeleccionado.precio || ''
      }))
    }
  }

  // Manejar selección de agente
  const handleAgenteChange = (agenteId) => {
    const agenteSeleccionado = agentes.find((a) => a.id === parseInt(agenteId))
    if (agenteSeleccionado) {
      setFormData((prev) => ({
        ...prev,
        agente_id: agenteSeleccionado.id,
        agente_nombre: agenteSeleccionado.nombre || '',
        agente_ci: agenteSeleccionado.ci || ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validar campos requeridos adicionales
    if (!formData.agente_id) {
      setMessage('❌ Debe seleccionar un agente')
      setLoading(false)
      return
    }

    if (!formData.inmueble_id) {
      setMessage('❌ Debe seleccionar un inmueble')
      setLoading(false)
      return
    }

    try {
      const res = await descargarContratoServiciosAnticretico(formData)
      if (res?.data) {
        const blob = new Blob([res.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `contrato_servicios_anticretico_inmobiliarios_${
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
    const camposRequeridos = [
      'ciudad',
      'fecha',
      'empresa_nombre',
      'empresa_representante',
      'empresa_ci',
      'cliente_nombre',
      'cliente_ci',
      'agente_id',
      'inmueble_id',
      'comision',
      'vigencia_dias'
    ]

    return camposRequeridos.every(
      (field) => formData[field] && formData[field].toString().trim() !== ''
    )
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
      custom: true,
      content: (
        <div className='space-y-4'>
          {user?.grupo_nombre === 'agente' ? (
            // Si es agente, mostrar info fija
            <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <h4 className='font-semibold text-blue-800 mb-2'>
                Agente Asignado (Usted)
              </h4>
              <p>
                <strong>Nombre:</strong> {user.nombre}
              </p>
              <p>
                <strong>CI:</strong> {user.ci || 'No especificado'}
              </p>
              <input type='hidden' name='agente_id' value={user.id} />
              <input type='hidden' name='agente_nombre' value={user.nombre} />
              <input type='hidden' name='agente_ci' value={user.ci || ''} />
            </div>
          ) : (
            // Si no es agente, mostrar selector
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Seleccionar Agente <span className='text-red-500'>*</span>
              </label>
              <select
                value={formData.agente_id}
                onChange={(e) => handleAgenteChange(e.target.value)}
                required
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                disabled={loadingAgentes}
              >
                <option value=''>
                  {loadingAgentes
                    ? 'Cargando agentes...'
                    : 'Seleccione un agente'}
                </option>
                {agentes.map((agente) => (
                  <option key={agente.id} value={agente.id}>
                    {agente.nombre} - {agente.ci || 'Sin CI'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Campos adicionales del agente */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Estado Civil del Agente
              </label>
              <input
                name='agente_estado_civil'
                type='text'
                value={formData.agente_estado_civil}
                onChange={handleChange}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Estado civil del agente'
              />
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Domicilio del Agente
              </label>
              <input
                name='agente_domicilio'
                type='text'
                value={formData.agente_domicilio}
                onChange={handleChange}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Domicilio del agente'
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: '🏠 Selección de Inmueble',
      custom: true,
      content: (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Seleccionar Inmueble <span className='text-red-500'>*</span>
            </label>
            <select
              value={formData.inmueble_id}
              onChange={(e) => handleInmuebleChange(e.target.value)}
              required
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              disabled={loadingInmuebles}
            >
              <option value=''>
                {loadingInmuebles
                  ? 'Cargando inmuebles...'
                  : 'Seleccione un inmueble'}
              </option>
              {inmuebles.map((inmueble) => (
                <option key={inmueble.id} value={inmueble.id}>
                  {inmueble.titulo} - {inmueble.direccion} - {inmueble.ciudad}
                </option>
              ))}
            </select>
          </div>

          {/* Campos del inmueble que se autocompletan */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Dirección del Inmueble
              </label>
              <input
                name='inmueble_direccion'
                type='text'
                value={formData.inmueble_direccion}
                onChange={handleChange}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Se autocompleta al seleccionar inmueble'
                readOnly
              />
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Precio del Inmueble
              </label>
              <input
                name='precio_inmueble'
                type='text'
                value={formData.precio_inmueble}
                onChange={handleChange}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Se autocompleta al seleccionar inmueble'
                readOnly
              />
            </div>
          </div>

          {/* Campos adicionales del inmueble */}
          <div className='grid gap-4 md:grid-cols-2'>
            {[
              { name: 'inmueble_superficie', label: 'Superficie' },
              { name: 'inmueble_distrito', label: 'Distrito' },
              { name: 'inmueble_manzana', label: 'Manzana' },
              { name: 'inmueble_lote', label: 'Lote' },
              { name: 'inmueble_zona', label: 'Zona' },
              { name: 'inmueble_matricula', label: 'Matrícula' }
            ].map((field) => (
              <div key={field.name} className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  {field.label}
                </label>
                <input
                  name={field.name}
                  type='text'
                  value={formData[field.name]}
                  onChange={handleChange}
                  className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder={field.label}
                />
              </div>
            ))}
          </div>
        </div>
      )
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

            {section.custom ? (
              section.content
            ) : (
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
            )}

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
            className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            <PrinterIcon size={20} />
            {loading ? '⏳ Generando PDF...' : '📄 Generar Contrato PDF'}
          </button>
        </div>

        {!isFormValid() && (
          <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <p className='text-yellow-700 text-sm text-center'>
              ⚠️ Complete todos los campos obligatorios para habilitar la
              generación del contrato
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default FormContratoServicios
