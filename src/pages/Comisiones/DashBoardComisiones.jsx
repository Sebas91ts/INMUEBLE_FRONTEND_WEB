import { useState, useEffect } from 'react'
import {
  getDashboardComisiones,
  getDetalleComisionesAgente
} from '../../api/comisiones/comisiones'
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckSquare,
  Square
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

const DashboardComisiones = () => {
  const [datos, setDatos] = useState(null)
  const [agenteSeleccionado, setAgenteSeleccionado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    tipo_contrato: 'todos',
    incluir_servicios: false
  })
  const [soloHayServicios, setSoloHayServicios] = useState(false)

  const tiposContrato = [
    { value: 'todos', label: 'Todos los contratos ejecutados' },
    { value: 'venta', label: 'Ventas' },
    { value: 'alquiler', label: 'Alquileres' },
    { value: 'anticretico', label: 'Anticréticos' }
  ]

  const cargarDashboard = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.fecha_inicio)
        params.append('fecha_inicio', filtros.fecha_inicio)
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin)
      if (filtros.tipo_contrato !== 'todos')
        params.append('tipo_contrato', filtros.tipo_contrato)

      // Incluir servicios solo si está explícitamente seleccionado
      params.append('incluir_servicios', filtros.incluir_servicios)

      const response = await getDashboardComisiones(params)
      const responseData = response.data.values
      setDatos(responseData)
      setAgenteSeleccionado(null)

      // Detectar si solo hay contratos de servicios
      const hayContratosEjecutados =
        responseData.stats_generales?.total_contratos > 0
      const haySoloServicios =
        !hayContratosEjecutados && responseData.hay_contratos_servicios

      setSoloHayServicios(haySoloServicios)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const verDetalleAgente = async (agenteId) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.fecha_inicio)
        params.append('fecha_inicio', filtros.fecha_inicio)
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin)
      if (filtros.tipo_contrato !== 'todos')
        params.append('tipo_contrato', filtros.tipo_contrato)
      params.append('incluir_servicios', filtros.incluir_servicios)

      const response = await getDetalleComisionesAgente(agenteId, params)
      setAgenteSeleccionado(response.data.values)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // const exportarReporte = () => {
  //   console.log('Exportando reporte...')
  // }

  // Efecto para cargar datos cuando cambian los filtros principales
  useEffect(() => {
    cargarDashboard()
  }, [filtros.incluir_servicios, filtros.tipo_contrato])

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

  const mostrarSoloServicios = () => {
    setFiltros((prev) => ({
      ...prev,
      incluir_servicios: true,
      tipo_contrato: 'todos' // Resetear tipo de contrato cuando mostramos solo servicios
    }))
  }

  const mostrarSoloEjecutados = () => {
    setFiltros((prev) => ({
      ...prev,
      incluir_servicios: false,
      tipo_contrato: 'todos'
    }))
  }

  const mostrarTodos = () => {
    setFiltros((prev) => ({
      ...prev,
      incluir_servicios: true,
      tipo_contrato: 'todos'
    }))
  }

  if (loading)
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Cargando dashboard...</p>
        </div>
      </div>
    )

  // Mostrar estado especial cuando solo hay servicios
  if (!datos && soloHayServicios) {
    return (
      <div className='p-6 space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Dashboard de Comisiones
            </h1>
            <p className='text-gray-600'>
              Control y análisis de comisiones generadas
            </p>
          </div>
        </div>

        <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center'>
          <AlertCircle className='h-16 w-16 text-yellow-500 mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-yellow-800 mb-2'>
            Solo hay contratos de servicios disponibles
          </h3>
          <p className='text-yellow-700 mb-6 max-w-2xl mx-auto'>
            Actualmente solo existen contratos de servicios inmobiliarios
            (prospectos) en el sistema.
          </p>
          <button
            onClick={mostrarSoloServicios}
            className='bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 mx-auto'
          >
            <Eye size={20} />
            <span>Ver contratos de servicios</span>
          </button>
        </div>
      </div>
    )
  }

  if (!datos)
    return (
      <div className='p-6 space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Dashboard de Comisiones
            </h1>
            <p className='text-gray-600'>
              Control y análisis de comisiones generadas
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
              onClick={mostrarSoloServicios}
              className='bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 mx-auto'
            >
              <Eye size={18} />
              <span>Incluir contratos de servicios</span>
            </button>
          </div>
        </div>
      </div>
    )

  // Preparar datos para gráficos
  const datosMensuales =
    datos.comisiones_mensuales?.map((item) => ({
      label: `${item.mes}/${item.ano}`,
      value: item.total_comision || 0
    })) || []

  const datosPorTipo =
    datos.comisiones_tipo?.map((item) => ({
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

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Dashboard de Comisiones
          </h1>
          <p className='text-gray-600'>
            {filtros.incluir_servicios
              ? 'Mostrando todos los contratos (incluyendo servicios)'
              : 'Mostrando solo contratos ejecutados (excluyendo servicios)'}
          </p>
        </div>
        <div className='flex items-center space-x-4'>
          {/* Selector de vista mejorado */}
          <div className='flex bg-gray-100 rounded-lg p-1'>
            <button
              onClick={mostrarSoloEjecutados}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                !filtros.incluir_servicios
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={16} />
              <span>Ejecutados</span>
            </button>
            {/* <button
              onClick={mostrarSoloServicios}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                filtros.incluir_servicios && filtros.tipo_contrato === 'todos'
                  ? 'bg-white text-yellow-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={16} />
              <span>Servicios</span>
            </button> */}
            <button
              onClick={mostrarTodos}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                filtros.incluir_servicios
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckSquare size={16} />
              <span>Todos</span>
            </button>
          </div>

          {/* <button
            onClick={exportarReporte}
            className='flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
          >
            <Download size={18} />
            <span>Exportar</span>
          </button> */}
        </div>
      </div>

      {/* Filtros Mejorados */}
      <div className='bg-white p-6 rounded-xl shadow-sm border'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold flex items-center space-x-2'>
            <Filter size={20} />
            <span>Filtros Adicionales</span>
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
              Tipo de Operación
            </label>
            <select
              value={filtros.tipo_contrato}
              onChange={(e) =>
                setFiltros({ ...filtros, tipo_contrato: e.target.value })
              }
              className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              // disabled={!filtros.incluir_servicios} // Deshabilitar cuando solo mostramos servicios
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

        {/* Info sobre la vista actual */}
        <div className='mt-4 p-3 rounded-lg border'>
          {!filtros.incluir_servicios ? (
            <div className='bg-blue-50 border-blue-200'>
              <div className='flex items-center space-x-2 text-blue-700'>
                <FileText size={16} />
                <span className='text-sm font-medium'>
                  Vista: Solo contratos ejecutados
                </span>
              </div>
              <p className='text-xs text-blue-600 mt-1'>
                Mostrando ventas, alquileres y anticréticos. Los contratos de
                servicios están excluidos.
              </p>
            </div>
          ) : filtros.tipo_contrato === 'todos' ? (
            <div className='bg-green-50 border-green-200'>
              <div className='flex items-center space-x-2 text-green-700'>
                <CheckSquare size={16} />
                <span className='text-sm font-medium'>
                  Vista: Todos los contratos
                </span>
              </div>
              <p className='text-xs text-green-600 mt-1'>
                Mostrando todos los contratos incluyendo servicios (comisiones
                potenciales).
              </p>
            </div>
          ) : (
            <div className='bg-yellow-50 border-yellow-200'>
              <div className='flex items-center space-x-2 text-yellow-700'>
                <Eye size={16} />
                <span className='text-sm font-medium'>
                  Vista: Solo contratos de servicios
                </span>
              </div>
              <p className='text-xs text-yellow-600 mt-1'>
                Mostrando solo contratos de servicios inmobiliarios (comisiones
                potenciales).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resto del dashboard (igual que antes pero adaptado) */}
      {!agenteSeleccionado ? (
        <>
          {/* Estadísticas Generales */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Contratos
                  </p>
                  <p className='text-3xl font-bold text-gray-900 mt-2'>
                    {datos.stats_generales.total_contratos}
                  </p>
                  {filtros.incluir_servicios && (
                    <p className='text-xs text-gray-500 mt-1'>
                      Incluye {datos.stats_generales.contratos_servicios || 0}{' '}
                      servicios
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
                    $
                    {datos.stats_generales.total_comisiones?.toLocaleString() ||
                      '0'}
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
                    {datos.stats_generales.comision_promedio?.toFixed(2)}%
                  </p>
                </div>
                <div className='p-3 bg-purple-100 rounded-lg'>
                  <TrendingUp className='h-6 w-6 text-purple-600' />
                </div>
              </div>
              <div className='flex items-center mt-4 text-sm text-gray-600'>
                <span>Por contrato</span>
              </div>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Agentes Activos
                  </p>
                  <p className='text-3xl font-bold text-gray-900 mt-2'>
                    {datos.comisiones_agente?.length || 0}
                  </p>
                </div>
                <div className='p-3 bg-orange-100 rounded-lg'>
                  <Users className='h-6 w-6 text-orange-600' />
                </div>
              </div>
              <div className='flex items-center mt-4 text-sm text-gray-600'>
                <span>
                  {filtros.incluir_servicios
                    ? 'Con actividad'
                    : 'Generando comisiones'}
                </span>
              </div>
            </div>
          </div>

          {/* Gráficos y Top Contratos */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Comisiones Mensuales */}
            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <h3 className='text-lg font-semibold mb-4 flex items-center space-x-2'>
                <Calendar size={20} />
                <span>
                  Comisiones Últimos 6 Meses
                  {filtros.incluir_servicios && ' (incl. servicios)'}
                </span>
              </h3>
              {datosMensuales.length > 0 ? (
                <SimpleBarChart data={datosMensuales} color='#10b981' />
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  No hay datos mensuales disponibles
                </div>
              )}
            </div>

            {/* Comisiones por Tipo */}
            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <h3 className='text-lg font-semibold mb-4 flex items-center space-x-2'>
                <Building size={20} />
                <span>
                  Comisiones por Tipo
                  {filtros.incluir_servicios && ' (incl. servicios)'}
                </span>
              </h3>
              {datosPorTipo.length > 0 ? (
                <SimpleBarChart data={datosPorTipo} color='#3b82f6' />
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  No hay datos por tipo de operación
                </div>
              )}
            </div>
          </div>

          {/* Top Agentes Mejorado */}
          <div className='bg-white p-6 rounded-xl shadow-sm border'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-semibold flex items-center space-x-2'>
                <Users size={24} />
                <span>
                  Top Agentes por Comisión
                  {filtros.incluir_servicios && ' (incl. servicios)'}
                </span>
              </h3>
              <span className='text-sm text-gray-500'>
                {datos.comisiones_agente?.length || 0} agentes
              </span>
            </div>
            <div className='space-y-4'>
              {datos.comisiones_agente?.map((agente, index) => (
                <div
                  key={agente.agente__id}
                  className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-600'
                          : index === 1
                          ? 'bg-gray-100 text-gray-600'
                          : index === 2
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <span className='font-bold'>#{index + 1}</span>
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>
                        {agente.agente__nombre}
                      </p>
                      <p className='text-sm text-gray-500'>
                        @{agente.agente__username}
                      </p>
                      {filtros.incluir_servicios &&
                        agente.contratos_servicios > 0 && (
                          <p className='text-xs text-blue-600'>
                            {agente.contratos_servicios} servicios
                          </p>
                        )}
                    </div>
                  </div>
                  <div className='flex items-center space-x-6'>
                    <div className='text-right'>
                      <p
                        className={`text-lg font-bold ${
                          filtros.incluir_servicios
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        ${agente.total_comision?.toLocaleString() || 0}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {agente.total_contratos} contratos
                      </p>
                    </div>
                    <button
                      onClick={() => verDetalleAgente(agente.agente__id)}
                      className='bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2'
                    >
                      <span>Ver Detalle</span>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contratos */}
          {datos.top_contratos?.length > 0 && (
            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <h3 className='text-xl font-semibold mb-6 flex items-center space-x-2'>
                <DollarSign size={24} />
                <span>
                  Top Contratos por Comisión
                  {filtros.incluir_servicios && ' (incl. servicios)'}
                </span>
              </h3>
              <div className='space-y-3'>
                {datos.top_contratos.map((contrato, index) => (
                  <div
                    key={contrato.id}
                    className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                        <span className='text-sm font-semibold'>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className='font-semibold'>{contrato.agente}</p>
                        <p className='text-sm text-gray-500'>
                          {contrato.inmueble}
                        </p>
                        {contrato.tipo_contrato === 'servicios' && (
                          <p className='text-xs text-yellow-600 font-medium'>
                            SERVICIO (Potencial)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      {/* NUEVO: Monto del contrato */}
                      <p className='text-lg font-bold text-blue-600'>
                        ${contrato.monto_contrato?.toLocaleString() || '0'}
                      </p>
                      <p className='text-sm text-gray-500 mb-1'>
                        Valor del contrato
                      </p>

                      {/* Comisión */}
                      <p
                        className={`font-bold ${
                          contrato.tipo_contrato === 'servicios'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        ${contrato.comision_monto?.toLocaleString()}
                      </p>
                      <p className='text-sm text-gray-500 capitalize'>
                        {contrato.tipo_contrato} •{' '}
                        {contrato.comision_porcentaje}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Detalle del Agente */
        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <button
            onClick={() => setAgenteSeleccionado(null)}
            className='flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors'
          >
            <ArrowDownRight size={16} />
            <span>Volver al dashboard</span>
          </button>

          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {agenteSeleccionado.stats_agente.agente_nombre}
            </h2>
            <p className='text-gray-600'>
              @{agenteSeleccionado.stats_agente.agente_username}
            </p>
            {filtros.incluir_servicios && (
              <p className='text-sm text-yellow-600 mt-1'>
                Incluyendo contratos de servicios (comisiones potenciales)
              </p>
            )}
          </div>

          {/* Stats del Agente */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-blue-50 p-4 rounded-lg'>
              <p className='text-sm text-blue-600 font-medium'>
                Total Contratos
              </p>
              <p className='text-2xl font-bold text-blue-900'>
                {agenteSeleccionado.stats_agente.total_contratos}
              </p>
              {filtros.incluir_servicios &&
                agenteSeleccionado.stats_agente.contratos_servicios > 0 && (
                  <p className='text-xs text-blue-600'>
                    {agenteSeleccionado.stats_agente.contratos_servicios}{' '}
                    servicios
                  </p>
                )}
            </div>
            <div className='bg-green-50 p-4 rounded-lg'>
              <p className='text-sm text-green-600 font-medium'>
                {filtros.incluir_servicios
                  ? 'Total Comisiones (potenciales)'
                  : 'Total Comisiones'}
              </p>
              <p className='text-2xl font-bold text-green-900'>
                $
                {agenteSeleccionado.stats_agente.total_comision?.toLocaleString()}
              </p>
            </div>
            <div className='bg-purple-50 p-4 rounded-lg'>
              <p className='text-sm text-purple-600 font-medium'>
                Comisión Promedio
              </p>
              <p className='text-2xl font-bold text-purple-900'>
                {agenteSeleccionado.stats_agente.comision_promedio?.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Contratos del Agente */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>
              Contratos del Agente
              {filtros.incluir_servicios && ' (incluyendo servicios)'}
            </h3>
            <div className='space-y-3'>
              {agenteSeleccionado.contratos?.map((contrato) => (
                <div
                  key={contrato.id}
                  className={`border rounded-lg p-4 ${
                    contrato.tipo_contrato === 'servicios'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='font-semibold'>{contrato.cliente}</p>
                      <p className='text-sm text-gray-500'>
                        {contrato.inmueble}
                      </p>
                      <p className='text-sm text-gray-500 capitalize'>
                        {contrato.tipo_contrato} •{' '}
                        {new Date(contrato.fecha_contrato).toLocaleDateString()}
                      </p>
                      {contrato.tipo_contrato === 'servicios' && (
                        <p className='text-xs text-yellow-600 font-medium mt-1'>
                          Contrato de Servicios (Comisión Potencial)
                        </p>
                      )}
                    </div>
                    <div className='text-right'>
                      {/* NUEVO: Monto del contrato */}
                      <p className='text-lg font-bold text-blue-600'>
                        ${contrato.monto_contrato?.toLocaleString() || '0'}
                      </p>
                      <p className='text-sm text-gray-500 mb-2'>
                        Valor del contrato
                      </p>

                      {/* Comisión */}
                      <p
                        className={`font-bold ${
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardComisiones
