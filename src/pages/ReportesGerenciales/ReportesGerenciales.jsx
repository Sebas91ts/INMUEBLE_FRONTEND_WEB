import React, { useState, useEffect } from 'react'
import {
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Home,
  FileCheck,
  AlertCircle,
  MessageSquare,
  BarChart3,
  Filter,
  RefreshCw,
  DollarSign,
  UserCheck,
  Clock
} from 'lucide-react'

import {
  getDashboard,
  getReporteInmuebles,
  getReporteAgentes,
  getReporteContratos,
  getReporteFinanciero
} from '../../api/reportes/reportes'

import {
  exportarDashboardPDF,
  exportarDashboardExcel
} from './utils/reportesExport'

const ReportesGerenciales = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [reporteSeleccionado, setReporteSeleccionado] = useState('dashboard')
  const [datosReporte, setDatosReporte] = useState(null)

  useEffect(() => {
    cargarDashboard()
    // Establecer fechas por defecto (últimos 30 días)
    const hoy = new Date()
    const hace30Dias = new Date(hoy)
    hace30Dias.setDate(hace30Dias.getDate() - 30)

    setFechaFin(hoy.toISOString().split('T')[0])
    setFechaInicio(hace30Dias.toISOString().split('T')[0])
  }, [])

  const cargarDashboard = async () => {
    try {
      setLoading(true)
      const response = await getDashboard()
      console.log('Dashboard data:', response.data.values)
      if (response.data.status === 1) {
        setDashboardData(response.data.values)
        setDatosReporte(null) // Limpiar datos de reporte específico
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarReporte = async () => {
    try {
      setLoading(true)
      const params = { fecha_inicio: fechaInicio, fecha_fin: fechaFin }

      let response
      switch (reporteSeleccionado) {
        case 'inmuebles':
          response = await getReporteInmuebles(params)
          console.log('Datos recibidos de inmueble:', response.data.values)
          break
        case 'contratos':
          response = await getReporteContratos(params)
          console.log('Datos recibidos de contrato:', response.data.values)
          break
        case 'agentes':
          response = await getReporteAgentes(params)
          console.log('Datos recibidos de agente:', response.data.values)
          break
        case 'financiero':
          response = await getReporteFinanciero(params)
          console.log('Datos recibidos de financiero:', response.data.values)
          break
        default:
          response = await getDashboard()
      }

      if (response.data.status === 1) {
        if (reporteSeleccionado === 'dashboard') {
          setDashboardData(response.data.values)
          setDatosReporte(null)
        } else {
          setDatosReporte(response.data.values)
          setDashboardData(null)
        }
      }
    } catch (error) {
      console.error('Error al cargar reporte:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportarPDF = () => {
    const datos =
      reporteSeleccionado === 'dashboard' ? dashboardData : datosReporte
    exportarDashboardPDF(datos, fechaInicio, fechaFin, reporteSeleccionado)
  }

  const exportarExcel = () => {
    const datos =
      reporteSeleccionado === 'dashboard' ? dashboardData : datosReporte
    exportarDashboardExcel(datos, fechaInicio, fechaFin, reporteSeleccionado)
  }

  // Función para determinar qué datos mostrar
  const obtenerDatosParaMostrar = () => {
    if (reporteSeleccionado === 'dashboard') {
      return dashboardData
    }
    return datosReporte
  }

  const datos = obtenerDatosParaMostrar()

  // Renderizado condicional basado en el tipo de reporte
  const renderContenidoReporte = () => {
    if (loading) {
      return (
        <div className='flex justify-center items-center py-12'>
          <RefreshCw className='w-8 h-8 animate-spin text-blue-600' />
          <span className='ml-2 text-gray-600'>Cargando datos...</span>
        </div>
      )
    }

    if (!datos) {
      return (
        <div className='text-center py-12 bg-white rounded-lg shadow-md'>
          <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-600'>
            No hay datos disponibles para el período seleccionado
          </p>
        </div>
      )
    }

    switch (reporteSeleccionado) {
      case 'dashboard':
        return <DashboardGeneral datos={datos} />
      case 'inmuebles':
        return <ReporteInmuebles datos={datos} />
      case 'contratos':
        return <ReporteContratos datos={datos} />
      case 'agentes':
        return <ReporteAgentes datos={datos} />
      case 'financiero':
        return <ReporteFinanciero datos={datos} />
      default:
        return <DashboardGeneral datos={datos} />
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
          {reporteSeleccionado === 'dashboard'
            ? 'Dashboard Gerencial'
            : `Reporte de ${
                reporteSeleccionado.charAt(0).toUpperCase() +
                reporteSeleccionado.slice(1)
              }`}
        </h1>
        <p className='text-gray-600'>
          Período: {datos?.periodo || `${fechaInicio} a ${fechaFin}`}
        </p>
      </div>

      {/* Filtros y Acciones */}
      <div className='bg-white rounded-lg shadow-md p-4 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Fecha Inicio
            </label>
            <input
              type='date'
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Fecha Fin
            </label>
            <input
              type='date'
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Tipo de Reporte
            </label>
            <select
              value={reporteSeleccionado}
              onChange={(e) => setReporteSeleccionado(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='dashboard'>Dashboard General</option>
              <option value='inmuebles'>Inmuebles</option>
              <option value='contratos'>Contratos</option>
              <option value='agentes'>Agentes</option>
              <option value='financiero'>Financiero</option>
            </select>
          </div>

          <div className='flex items-end gap-2'>
            <button
              onClick={cargarReporte}
              disabled={loading}
              className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* Botones de Exportación */}
        <div className='flex gap-3 mt-4'>
          <button
            onClick={exportarPDF}
            disabled={!datos}
            className='flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <FileText className='w-4 h-4' />
            Exportar PDF
          </button>

          <button
            onClick={exportarExcel}
            disabled={!datos}
            className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <FileSpreadsheet className='w-4 h-4' />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Contenido del reporte */}
      {renderContenidoReporte()}
    </div>
  )
}

// Componente para Dashboard General
const DashboardGeneral = ({ datos }) => {
  return (
    <>
      {/* KPIs Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
        {/* Inmuebles */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Total Inmuebles
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                {datos?.inmuebles?.total || 0}
              </p>
              <p className='text-sm text-green-600 mt-2'>
                {datos?.inmuebles?.aprobados || 0} aprobados
              </p>
            </div>
            <div className='bg-blue-100 p-3 rounded-full'>
              <Home className='w-6 h-6 text-blue-600' />
            </div>
          </div>
        </div>

        {/* Contratos */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Contratos Activos
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                {datos?.contratos?.activos || 0}
              </p>
              <p className='text-sm text-blue-600 mt-2'>
                +{datos?.contratos?.nuevos_mes || 0} este mes
              </p>
            </div>
            <div className='bg-purple-100 p-3 rounded-full'>
              <FileCheck className='w-6 h-6 text-purple-600' />
            </div>
          </div>
        </div>

        {/* Ingresos */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>Ingresos Mes</p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                ${(datos?.ingresos?.mes_actual || 0).toLocaleString('es-ES')}
              </p>
              <p className='text-sm text-gray-500 mt-2'>
                Total: ${(datos?.ingresos?.total || 0).toLocaleString('es-ES')}
              </p>
            </div>
            <div className='bg-green-100 p-3 rounded-full'>
              <TrendingUp className='w-6 h-6 text-green-600' />
            </div>
          </div>
        </div>

        {/* Usuarios */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Agentes Activos
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                {datos?.usuarios?.agentes_activos || 0}
              </p>
              <p className='text-sm text-gray-500 mt-2'>
                {datos?.usuarios?.clientes_activos || 0} clientes
              </p>
            </div>
            <div className='bg-orange-100 p-3 rounded-full'>
              <Users className='w-6 h-6 text-orange-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Alertas y Comunicación */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        {/* Alertas */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <AlertCircle className='w-5 h-5 text-red-600' />
            Alertas
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between items-center p-3 bg-red-50 rounded-md'>
              <span className='text-gray-700'>Pendientes de Envío</span>
              <span className='font-bold text-red-600'>
                {datos?.alertas?.pendientes || 0}
              </span>
            </div>
            <div className='flex justify-between items-center p-3 bg-yellow-50 rounded-md'>
              <span className='text-gray-700'>No Vistas</span>
              <span className='font-bold text-yellow-600'>
                {datos?.alertas?.no_vistas || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Comunicación */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <MessageSquare className='w-5 h-5 text-blue-600' />
            Comunicación
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between items-center p-3 bg-blue-50 rounded-md'>
              <span className='text-gray-700'>Mensajes Sin Leer</span>
              <span className='font-bold text-blue-600'>
                {datos?.comunicacion?.chats_con_mensajes_sin_leer || 0}
              </span>
            </div>
            <div className='flex justify-between items-center p-3 bg-green-50 rounded-md'>
              <span className='text-gray-700'>Citas Hoy</span>
              <span className='font-bold text-green-600'>
                {datos?.citas?.hoy || 0}
              </span>
            </div>
            <div className='flex justify-between items-center p-3 bg-purple-50 rounded-md'>
              <span className='text-gray-700'>Citas Próxima Semana</span>
              <span className='font-bold text-purple-600'>
                {datos?.citas?.proxima_semana || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de Inmuebles */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
          <BarChart3 className='w-5 h-5 text-blue-600' />
          Distribución de Inmuebles
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {datos?.inmuebles?.por_estado?.map((item, index) => (
            <div key={index} className='p-4 bg-gray-50 rounded-md'>
              <p className='text-sm text-gray-600 capitalize'>{item.estado}</p>
              <p className='text-2xl font-bold text-gray-800 mt-1'>
                {item.total}
              </p>
              <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full'
                  style={{
                    width: `${
                      (item.total / (datos?.inmuebles?.total || 1)) * 100
                    }%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// Componente para Reporte de Inmuebles
const ReporteInmuebles = ({ datos }) => {
  return (
    <div className='space-y-6'>
      {/* KPIs para Inmuebles */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Total Inmuebles
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                {datos?.total_inmuebles || 0}
              </p>
            </div>
            <Home className='w-8 h-8 text-blue-600' />
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Precio Promedio
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                $
                {(datos?.estadisticas_precio?.promedio || 0).toLocaleString(
                  'es-ES'
                )}
              </p>
            </div>
            <DollarSign className='w-8 h-8 text-green-600' />
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Superficie Promedio
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                {(datos?.superficie_promedio || 0).toFixed(2)} m²
              </p>
            </div>
            <BarChart3 className='w-8 h-8 text-purple-600' />
          </div>
        </div>
      </div>

      {/* Distribución por Tipo de Operación */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          Por Tipo de Operación
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {datos?.por_tipo_operacion?.map((item, index) => (
            <div key={index} className='p-4 bg-gray-50 rounded-md'>
              <p className='text-sm text-gray-600 capitalize'>
                {item.tipo_operacion}
              </p>
              <p className='text-2xl font-bold text-gray-800 mt-1'>
                {item.total}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Distribución por Estado */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Por Estado</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {datos?.por_estado?.map((item, index) => (
            <div key={index} className='p-4 bg-gray-50 rounded-md'>
              <p className='text-sm text-gray-600 capitalize'>{item.estado}</p>
              <p className='text-2xl font-bold text-gray-800 mt-1'>
                {item.total}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Agentes */}
      {datos?.top_agentes && datos.top_agentes.length > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Top Agentes
          </h3>
          <div className='space-y-3'>
            {datos.top_agentes.map((agente, index) => (
              <div
                key={index}
                className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
              >
                <span className='font-medium'>{agente.agente__nombre}</span>
                <span className='text-blue-600 font-bold'>
                  {agente.total} inmuebles
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para Reporte de Contratos
const ReporteContratos = ({ datos }) => {
  return (
    <div className='space-y-6'>
      {/* KPIs para Contratos */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Total Contratos
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                {datos?.total_contratos || 0}
              </p>
            </div>
            <FileCheck className='w-8 h-8 text-blue-600' />
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Ingresos Totales
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                ${(datos?.ingresos?.total || 0).toLocaleString('es-ES')}
              </p>
            </div>
            <DollarSign className='w-8 h-8 text-green-600' />
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Próximos a Vencer
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                {datos?.proximos_a_vencer || 0}
              </p>
            </div>
            <Clock className='w-8 h-8 text-orange-600' />
          </div>
        </div>
      </div>

      {/* Distribución por Tipo de Contrato */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          Por Tipo de Contrato
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {datos?.por_tipo_contrato?.map((item, index) => (
            <div key={index} className='p-4 bg-gray-50 rounded-md'>
              <p className='text-sm text-gray-600 capitalize'>
                {item.tipo_contrato}
              </p>
              <p className='text-2xl font-bold text-gray-800 mt-1'>
                {item.total}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Comisiones por Tipo */}
      {datos?.comisiones_por_tipo && datos.comisiones_por_tipo.length > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Comisiones por Tipo de Contrato
          </h3>
          <div className='space-y-4'>
            {datos.comisiones_por_tipo.map((item, index) => (
              <div key={index} className='p-4 bg-gray-50 rounded-md'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-medium capitalize'>
                    {item.tipo_contrato}
                  </span>
                  <span className='text-green-600 font-bold'>
                    ${(item.total || 0).toLocaleString('es-ES')}
                  </span>
                </div>
                <div className='flex justify-between text-sm text-gray-600'>
                  <span>
                    Promedio: ${(item.promedio || 0).toLocaleString('es-ES')}
                  </span>
                  <span>{item.cantidad} contratos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Agentes */}
      {datos?.top_agentes && datos.top_agentes.length > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Top Agentes por Comisiones
          </h3>
          <div className='space-y-3'>
            {datos.top_agentes.map((agente, index) => (
              <div
                key={index}
                className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
              >
                <div>
                  <p className='font-medium'>{agente.agente}</p>
                  <p className='text-sm text-gray-600'>
                    {agente.cantidad_contratos} contratos
                  </p>
                </div>
                <span className='text-green-600 font-bold'>
                  ${(agente.total_comisiones || 0).toLocaleString('es-ES')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para Reporte de Agentes
const ReporteAgentes = ({ datos }) => {
  return (
    <div className='space-y-6'>
      {/* KPIs para Agentes */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          <p className='text-gray-500 text-sm font-medium'>Total Agentes</p>
          <p className='text-3xl font-bold text-gray-800 mt-1'>
            {datos?.totales?.total_agentes || 0}
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <p className='text-gray-500 text-sm font-medium'>Total Inmuebles</p>
          <p className='text-3xl font-bold text-gray-800 mt-1'>
            {datos?.totales?.total_inmuebles || 0}
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <p className='text-gray-500 text-sm font-medium'>Total Contratos</p>
          <p className='text-3xl font-bold text-gray-800 mt-1'>
            {datos?.totales?.total_contratos || 0}
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <p className='text-gray-500 text-sm font-medium'>Total Comisiones</p>
          <p className='text-3xl font-bold text-gray-800 mt-1'>
            ${(datos?.totales?.total_comisiones || 0).toLocaleString('es-ES')}
          </p>
        </div>
      </div>

      {/* Lista de Agentes */}
      {datos?.agentes && datos.agentes.length > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Desempeño de Agentes
          </h3>
          <div className='space-y-4'>
            {datos.agentes.map((agente, index) => (
              <div key={index} className='p-4 bg-gray-50 rounded-md'>
                <div className='flex justify-between items-center mb-3'>
                  <h4 className='font-semibold text-lg'>{agente.nombre}</h4>
                  <span className='text-green-600 font-bold'>
                    $
                    {(agente.comisiones_generadas || 0).toLocaleString('es-ES')}
                  </span>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                  <div>
                    <p className='text-gray-600'>Inmuebles Publicados</p>
                    <p className='font-medium'>
                      {agente.inmuebles?.publicados || 0}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Inmuebles Aprobados</p>
                    <p className='font-medium'>
                      {agente.inmuebles?.aprobados || 0}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Contratos Cerrados</p>
                    <p className='font-medium'>
                      {agente.contratos?.cerrados || 0}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Tasa Conversión</p>
                    <p className='font-medium'>
                      {agente.tasa_conversion || 0}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para Reporte Financiero
const ReporteFinanciero = ({ datos }) => {
  return (
    <div className='space-y-6'>
      {/* KPIs para Financiero */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Total Comisiones
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                ${(datos?.total_comisiones || 0).toLocaleString('es-ES')}
              </p>
            </div>
            <DollarSign className='w-8 h-8 text-green-600' />
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>
                Proyección Ingresos
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                $
                {(datos?.proyeccion_ingresos_activos || 0).toLocaleString(
                  'es-ES'
                )}
              </p>
            </div>
            <TrendingUp className='w-8 h-8 text-blue-600' />
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm font-medium'>Evolución</p>
              <p className='text-3xl font-bold text-gray-800 mt-1'>
                {datos?.evolucion_temporal?.length || 0} períodos
              </p>
            </div>
            <BarChart3 className='w-8 h-8 text-purple-600' />
          </div>
        </div>
      </div>

      {/* Comisiones por Tipo */}
      {datos?.comisiones_por_tipo && datos.comisiones_por_tipo.length > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Comisiones por Tipo
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {datos.comisiones_por_tipo.map((item, index) => (
              <div key={index} className='p-4 bg-gray-50 rounded-md'>
                <p className='text-sm text-gray-600 capitalize'>{item.tipo}</p>
                <p className='text-2xl font-bold text-gray-800'>
                  ${(item.total || 0).toLocaleString('es-ES')}
                </p>
                <p className='text-sm text-gray-500'>
                  {item.cantidad} contratos
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Agentes */}
      {datos?.top_10_agentes && datos.top_10_agentes.length > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Top 10 Agentes
          </h3>
          <div className='space-y-3'>
            {datos.top_10_agentes.map((agente, index) => (
              <div
                key={index}
                className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
              >
                <div>
                  <p className='font-medium'>{agente.agente}</p>
                  <p className='text-sm text-gray-600'>
                    {agente.cantidad} contratos
                  </p>
                </div>
                <span className='text-green-600 font-bold'>
                  ${(agente.total || 0).toLocaleString('es-ES')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportesGerenciales
