// components/DashboardComisionAgente.jsx
import { useState, useEffect } from 'react'
import { getDetalleComisionesAgente } from '../../api/comisiones/comisiones'
import { useAuth } from '../../hooks/useAuth'
import {
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Building,
  ArrowUpRight,
  Download,
  Filter,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  User,
  BarChart3
} from 'lucide-react'

// Componente para gráficos simples
const SimpleBarChart = ({ data, color = '#3b82f6' }) => {
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className='flex items-end space-x-1 h-32'>
      {data.map((item, index) => (
        <div key={index} className='flex flex-col items-center flex-1'>
          <div
            className='w-full rounded-t transition-all duration-300 hover:opacity-80'
            style={{
              height: `${(item.value / maxValue) * 100}%`,
              backgroundColor: color,
              minHeight: '20px'
            }}
          />
          <span className='text-xs mt-1 text-gray-600'>{item.label}</span>
          <span className='text-xs font-semibold'>
            ${item.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

const DashboardComisionAgente = () => {
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    tipo_contrato: 'todos',
    incluir_servicios: false
  })
  const { user } = useAuth()

  const tiposContrato = [
    { value: 'todos', label: 'Todos los contratos' },
    { value: 'venta', label: 'Ventas' },
    { value: 'alquiler', label: 'Alquileres' },
    { value: 'anticretico', label: 'Anticréticos' }
  ]

  const cargarDashboard = async () => {
    if (!user) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.fecha_inicio)
        params.append('fecha_inicio', filtros.fecha_inicio)
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin)
      if (filtros.tipo_contrato !== 'todos')
        params.append('tipo_contrato', filtros.tipo_contrato)

      // ✅ ENVIAR el parámetro incluir_servicios al backend
      params.append('incluir_servicios', filtros.incluir_servicios)

      // Usar el ID del usuario autenticado (el agente mismo)
      const response = await getDetalleComisionesAgente(user.id, params)
      console.log('Datos recibidos:', response.data.values)
      setDatos(response.data.values)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar datos cuando cambian los filtros
  useEffect(() => {
    cargarDashboard()
  }, [filtros.incluir_servicios, filtros.tipo_contrato, user])

  const aplicarFiltros = () => {
    cargarDashboard()
  }

  const limpiarFiltros = () => {
    setFiltros({
      fecha_inicio: '',
      fecha_fin: '',
      tipo_contrato: 'todos',
      incluir_servicios: false
    })
  }

  const toggleIncluirServicios = (incluir) => {
    setFiltros((prev) => ({ ...prev, incluir_servicios: incluir }))
  }

  // Preparar datos para gráficos
  const datosPorTipo =
    datos?.comisiones_tipo?.map((item) => ({
      label:
        item.tipo_contrato === 'venta'
          ? 'Venta'
          : item.tipo_contrato === 'alquiler'
          ? 'Alquiler'
          : item.tipo_contrato === 'anticretico'
          ? 'Anticrético'
          : 'Servicios',
      value: item.total_comision || 0
    })) || []

  // Datos para gráfico de montos por tipo
  const datosMontosPorTipo =
    datos?.comisiones_tipo?.map((item) => ({
      label:
        item.tipo_contrato === 'venta'
          ? 'Venta'
          : item.tipo_contrato === 'alquiler'
          ? 'Alquiler'
          : item.tipo_contrato === 'anticretico'
          ? 'Anticrético'
          : 'Servicios',
      value: item.monto_total || 0
    })) || []

  if (loading)
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Cargando tus comisiones...</p>
        </div>
      </div>
    )

  if (!datos)
    return (
      <div className='p-6 space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Mis Comisiones</h1>
            <p className='text-gray-600'>
              Seguimiento de tus ingresos y contratos
            </p>
          </div>
        </div>

        <div className='text-center p-8'>
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto'>
            <DollarSign className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-yellow-800 mb-2'>
              No hay datos disponibles
            </h3>
            <p className='text-yellow-700 mb-4'>
              No se encontraron comisiones en el período seleccionado.
            </p>
            <button
              onClick={() => toggleIncluirServicios(true)}
              className='bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 mx-auto'
            >
              <Eye size={18} />
              <span>Incluir contratos de servicios</span>
            </button>
          </div>
        </div>
      </div>
    )

  return (
    <div className='p-6 space-y-6'>
      {/* Header Personalizado */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Mis Comisiones</h1>
          <p className='text-gray-600'>
            Resumen de tus contratos y comisiones generadas
          </p>
        </div>
        <div className='flex items-center space-x-4'>
          {/* Toggle para incluir servicios */}
          <div className='flex items-center space-x-2 bg-gray-100 rounded-lg p-2'>
            {filtros.incluir_servicios ? (
              <Eye size={18} className='text-blue-600' />
            ) : (
              <EyeOff size={18} className='text-gray-500' />
            )}
            <label className='flex items-center space-x-2 text-sm'>
              <span className='text-gray-700'>Incluir servicios</span>
              <input
                type='checkbox'
                checked={filtros.incluir_servicios}
                onChange={(e) => toggleIncluirServicios(e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
            </label>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className='bg-white p-6 rounded-xl shadow-sm border'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold flex items-center space-x-2'>
            <Filter size={20} />
            <span>Filtros</span>
          </h3>
          <button
            onClick={limpiarFiltros}
            className='text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1'
          >
            <X size={16} />
            <span>Limpiar</span>
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Fecha Inicio
            </label>
            <input
              type='date'
              value={filtros.fecha_inicio}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_inicio: e.target.value })
              }
              className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Fecha Fin
            </label>
            <input
              type='date'
              value={filtros.fecha_fin}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_fin: e.target.value })
              }
              className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Tipo de Contrato
            </label>
            <select
              value={filtros.tipo_contrato}
              onChange={(e) =>
                setFiltros({ ...filtros, tipo_contrato: e.target.value })
              }
              className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {tiposContrato.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='flex justify-end mt-4'>
          <button
            onClick={aplicarFiltros}
            className='bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors flex items-center space-x-2'
          >
            <Filter size={18} />
            <span>Aplicar Filtros</span>
          </button>
        </div>

        {/* Info sobre servicios */}
        {!filtros.incluir_servicios && (
          <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <div className='flex items-center space-x-2 text-blue-700'>
              <EyeOff size={16} />
              <span className='text-sm font-medium'>
                Contratos de servicios excluidos
              </span>
            </div>
            <p className='text-xs text-blue-600 mt-1'>
              Los contratos de servicios son prospectos y no generan comisiones
              reales hasta que se conviertan en ventas, alquileres o
              anticréticos.
            </p>
          </div>
        )}

        {filtros.incluir_servicios && (
          <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <div className='flex items-center space-x-2 text-yellow-700'>
              <Eye size={16} />
              <span className='text-sm font-medium'>
                Contratos de servicios incluidos
              </span>
            </div>
            <p className='text-xs text-yellow-600 mt-1'>
              Mostrando todos tus contratos incluyendo servicios (comisiones
              potenciales).
            </p>
          </div>
        )}
      </div>

      {/* Estadísticas Personales MEJORADAS */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Total Contratos
              </p>
              <p className='text-3xl font-bold text-gray-900 mt-2'>
                {datos.stats_agente.total_contratos}
              </p>
              {filtros.incluir_servicios && (
                <p className='text-xs text-gray-500 mt-1'>
                  Incluyendo contratos de servicios
                </p>
              )}
            </div>
            <div className='p-3 bg-blue-100 rounded-lg'>
              <FileText className='h-6 w-6 text-blue-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                {filtros.incluir_servicios
                  ? 'Total Comisiones (potenciales)'
                  : 'Total Comisiones'}
              </p>
              <p className='text-3xl font-bold text-gray-900 mt-2'>
                ${datos.stats_agente.total_comision?.toLocaleString() || '0'}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                filtros.incluir_servicios ? 'bg-yellow-100' : 'bg-green-100'
              }`}
            >
              <DollarSign
                className={`h-6 w-6 ${
                  filtros.incluir_servicios
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Comisión Promedio
              </p>
              <p className='text-3xl font-bold text-gray-900 mt-2'>
                {datos.stats_agente.comision_promedio?.toFixed(2)}%
              </p>
            </div>
            <div className='p-3 bg-purple-100 rounded-lg'>
              <TrendingUp className='h-6 w-6 text-purple-600' />
            </div>
          </div>
        </div>

        {/* NUEVO: Monto Total de Contratos */}
        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Valor Total Contratos
              </p>
              <p className='text-3xl font-bold text-gray-900 mt-2'>
                $
                {datos.stats_agente.monto_total_contratos?.toLocaleString() ||
                  '0'}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Suma de todos los contratos
              </p>
            </div>
            <div className='p-3 bg-indigo-100 rounded-lg'>
              <BarChart3 className='h-6 w-6 text-indigo-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y Distribución MEJORADOS */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Comisiones por Tipo */}
        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <h3 className='text-lg font-semibold mb-4 flex items-center space-x-2'>
            <DollarSign size={20} />
            <span>
              Comisiones por Tipo
              {filtros.incluir_servicios && ' (incl. servicios)'}
            </span>
          </h3>
          {datosPorTipo.length > 0 ? (
            <SimpleBarChart data={datosPorTipo} color='#10b981' />
          ) : (
            <div className='text-center py-8 text-gray-500'>
              No hay datos por tipo de contrato
            </div>
          )}
        </div>

        {/* NUEVO: Montos por Tipo */}
        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <h3 className='text-lg font-semibold mb-4 flex items-center space-x-2'>
            <BarChart3 size={20} />
            <span>
              Valor de Contratos por Tipo
              {filtros.incluir_servicios && ' (incl. servicios)'}
            </span>
          </h3>
          {datosMontosPorTipo.length > 0 ? (
            <SimpleBarChart data={datosMontosPorTipo} color='#3b82f6' />
          ) : (
            <div className='text-center py-8 text-gray-500'>
              No hay datos de montos por tipo
            </div>
          )}
        </div>
      </div>

      {/* Información del Agente */}
      <div className='bg-white p-6 rounded-xl shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4 flex items-center space-x-2'>
          <User size={20} />
          <span>Mi Información</span>
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm font-medium text-gray-600'>Nombre:</span>
            <span className='text-sm font-semibold'>
              {datos.stats_agente.agente_nombre}
            </span>
          </div>
          <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm font-medium text-gray-600'>Usuario:</span>
            <span className='text-sm font-semibold'>
              @{datos.stats_agente.agente_username}
            </span>
          </div>
          <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm font-medium text-gray-600'>
              Contratos activos:
            </span>
            <span className='text-sm font-semibold text-green-600'>
              {datos.stats_agente.total_contratos}
            </span>
          </div>
          <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm font-medium text-gray-600'>
              Valor gestionado:
            </span>
            <span className='text-sm font-semibold text-blue-600'>
              $
              {datos.stats_agente.monto_total_contratos?.toLocaleString() ||
                '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Contratos MEJORADA */}
      <div className='bg-white p-6 rounded-xl shadow-sm border'>
        <h3 className='text-xl font-semibold mb-6 flex items-center space-x-2'>
          <FileText size={24} />
          <span>
            Mis Contratos
            {filtros.incluir_servicios && ' (incluyendo servicios)'}
          </span>
        </h3>

        {datos.contratos?.length > 0 ? (
          <div className='space-y-4'>
            {datos.contratos.map((contrato) => (
              <div
                key={contrato.id}
                className={`border rounded-lg p-4 ${
                  contrato.tipo_contrato === 'servicios'
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 hover:bg-gray-50'
                } transition-colors`}
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-900'>
                          {contrato.cliente}
                        </p>
                        <p className='text-sm text-gray-600 mt-1'>
                          {contrato.inmueble}
                        </p>
                        <p className='text-sm text-gray-500 capitalize mt-1'>
                          {contrato.tipo_contrato} •{' '}
                          {new Date(
                            contrato.fecha_contrato
                          ).toLocaleDateString()}
                        </p>
                        {contrato.tipo_contrato === 'servicios' && (
                          <p className='text-xs text-yellow-600 font-medium mt-2'>
                            📋 Contrato de Servicios (Comisión Potencial)
                          </p>
                        )}
                      </div>
                      <div className='text-right ml-4'>
                        {/* NUEVO: Monto del contrato */}
                        <p className='text-lg font-bold text-blue-600'>
                          ${contrato.monto_contrato?.toLocaleString() || '0'}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Valor del contrato
                        </p>

                        {/* Comisión */}
                        <p
                          className={`text-lg font-bold mt-2 ${
                            contrato.tipo_contrato === 'servicios'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          ${contrato.comision_monto?.toLocaleString()}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {contrato.comision_porcentaje}% de comisión
                        </p>

                        <p className='text-xs text-gray-400 mt-1'>
                          {contrato.estado}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <FileText className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <p>No tienes contratos en el período seleccionado</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardComisionAgente
