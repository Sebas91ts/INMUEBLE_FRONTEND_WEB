// src/utils/reportesExport.js
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



/**
 * Exporta datos a PDF según el tipo de reporte
 */
export const exportarDashboardPDF = (data, fechaInicio, fechaFin, tipoReporte = 'dashboard') => {
  switch (tipoReporte) {
    case 'inmuebles':
      return exportarInmueblesPDF(data, { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    case 'contratos':
      return exportarContratosPDF(data, { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    case 'agentes':
      return exportarAgentesPDF(data, { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    case 'financiero':
      return exportarFinancieroPDF(data, { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    default:
      return exportarDashboardGeneralPDF(data, fechaInicio, fechaFin);
  }
};

/**
 * Exporta datos a Excel según el tipo de reporte
 */
export const exportarDashboardExcel = (data, fechaInicio, fechaFin, tipoReporte = 'dashboard') => {
  switch (tipoReporte) {
    case 'inmuebles':
      return exportarInmueblesExcel(data, { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    case 'contratos':
      return exportarContratosExcel(data, { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    case 'agentes':
      return exportarAgentesExcel(data, { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    case 'financiero':
      return exportarFinancieroExcel(data, { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    default:
      return exportarDashboardGeneralExcel(data, fechaInicio, fechaFin);
  }
};

/**
 * Exporta dashboard general a PDF
 */
const exportarDashboardGeneralPDF = (data, fechaInicio, fechaFin) => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString('es-ES');
  
  // Encabezado
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('REPORTE GERENCIAL', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generado: ${fecha}`, 14, 30);
  doc.text(`Período: ${fechaInicio} a ${fechaFin}`, 14, 36);
  
  // KPIs Principales
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text('Indicadores Principales', 14, 46);
  
  const kpisData = [
    ['Métrica', 'Valor'],
    ['Total Inmuebles', data?.inmuebles?.total || 0],
    ['Inmuebles Aprobados', data?.inmuebles?.aprobados || 0],
    ['Inmuebles Pendientes', data?.inmuebles?.pendientes || 0],
    ['Anuncios Activos', data?.anuncios?.activos || 0],
    ['Contratos Activos', data?.contratos?.activos || 0],
    ['Contratos Nuevos (Mes)', data?.contratos?.nuevos_mes || 0],
    ['Ingresos Mes Actual', `$${(data?.ingresos?.mes_actual || 0).toLocaleString('es-ES')}`],
    ['Ingresos Totales', `$${(data?.ingresos?.total || 0).toLocaleString('es-ES')}`]
  ];
  
  autoTable(doc,{
    startY: 52,
    head: [kpisData[0]],
    body: kpisData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  });
  
  // Usuarios
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text('Usuarios', 14, finalY);
  
  const usuariosData = [
    ['Tipo', 'Cantidad'],
    ['Agentes Activos', data?.usuarios?.agentes_activos || 0],
    ['Clientes Activos', data?.usuarios?.clientes_activos || 0],
    ['Solicitudes Pendientes', data?.usuarios?.solicitudes_pendientes || 0]
  ];
  
  autoTable(doc,{
    startY: finalY + 6,
    head: [usuariosData[0]],
    body: usuariosData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 }
  });
  
  // Alertas y Citas
  finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text('Alertas y Comunicación', 14, finalY);
  
  const alertasData = [
    ['Concepto', 'Cantidad'],
    ['Alertas Pendientes', data?.alertas?.pendientes || 0],
    ['Alertas No Vistas', data?.alertas?.no_vistas || 0],
    ['Citas Hoy', data?.citas?.hoy || 0],
    ['Citas Próxima Semana', data?.citas?.proxima_semana || 0],
    ['Chats con Mensajes Sin Leer', data?.comunicacion?.chats_con_mensajes_sin_leer || 0]
  ];
  
  autoTable(doc,{
    startY: finalY + 6,
    head: [alertasData[0]],
    body: alertasData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`reporte_gerencial_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporta dashboard general a Excel
 */
const exportarDashboardGeneralExcel = (data, fechaInicio, fechaFin) => {
  const wb = XLSX.utils.book_new();
  
  // Hoja 1: Resumen
  const resumenData = [
    ['REPORTE GERENCIAL'],
    [],
    ['Fecha de Generación', new Date().toLocaleDateString('es-ES')],
    ['Período', `${fechaInicio} a ${fechaFin}`],
    [],
    ['INMUEBLES'],
    ['Total', data?.inmuebles?.total || 0],
    ['Aprobados', data?.inmuebles?.aprobados || 0],
    ['Pendientes', data?.inmuebles?.pendientes || 0],
    [],
    ['ANUNCIOS'],
    ['Activos', data?.anuncios?.activos || 0],
    [],
    ['CONTRATOS'],
    ['Activos', data?.contratos?.activos || 0],
    ['Nuevos este mes', data?.contratos?.nuevos_mes || 0],
    [],
    ['INGRESOS'],
    ['Mes Actual', data?.ingresos?.mes_actual || 0],
    ['Total', data?.ingresos?.total || 0],
    [],
    ['USUARIOS'],
    ['Agentes Activos', data?.usuarios?.agentes_activos || 0],
    ['Clientes Activos', data?.usuarios?.clientes_activos || 0],
    ['Solicitudes Pendientes', data?.usuarios?.solicitudes_pendientes || 0],
    [],
    ['ALERTAS'],
    ['Pendientes', data?.alertas?.pendientes || 0],
    ['No Vistas', data?.alertas?.no_vistas || 0],
    [],
    ['CITAS'],
    ['Hoy', data?.citas?.hoy || 0],
    ['Próxima Semana', data?.citas?.proxima_semana || 0],
    [],
    ['COMUNICACIÓN'],
    ['Chats con Mensajes Sin Leer', data?.comunicacion?.chats_con_mensajes_sin_leer || 0]
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

  // Ajuste automático de ancho de columnas
const colWidths = resumenData[0].map((_, i) => ({
  wch: Math.max(...resumenData.map(row => (row[i] ? row[i].toString().length : 0))) + 2
}));
wsResumen['!cols'] = colWidths;
  // Estilos para el título
  if (wsResumen['A1']) {
    wsResumen['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: "3B82F6" } },
      alignment: { horizontal: "center" }
    };
  }
  for (let R = 2; R <= 3; ++R) { // filas con encabezados
  ['A','B'].forEach(C => {
    const cell = wsResumen[`${C}${R}`];
    if (cell) {
      cell.s = { font: { bold: true } };
    }
  });
}
  
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
  
  // Hoja 2: Inmuebles por Estado
  if (data?.inmuebles?.por_estado && data.inmuebles.por_estado.length > 0) {
    const inmueblesData = [
      ['Estado', 'Cantidad'],
      ...data.inmuebles.por_estado.map(item => [item.estado, item.total])
    ];
    
    const wsInmuebles = XLSX.utils.aoa_to_sheet(inmueblesData);
    XLSX.utils.book_append_sheet(wb, wsInmuebles, 'Inmuebles por Estado');
  }
  
  // Guardar archivo
  XLSX.writeFile(wb, `reporte_gerencial_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporta reporte de inmuebles a PDF
 */
export const exportarInmueblesPDF = (data, filtros) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('REPORTE DE INMUEBLES', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);
  if (data?.periodo) {
    doc.text(`Período: ${data.periodo}`, 14, 36);
  }
  
  // Tabla de resumen
  const resumenData = [
    ['Métrica', 'Valor'],
    ['Total Inmuebles', data?.total_inmuebles || 0],
    ['Superficie Promedio', `${(data?.superficie_promedio || 0).toFixed(2)} m²`],
    ['Precio Promedio', `$${(data?.estadisticas_precio?.promedio || 0).toLocaleString('es-ES')}`],
    ['Precio Mínimo', `$${(data?.estadisticas_precio?.minimo || 0).toLocaleString('es-ES')}`],
    ['Precio Máximo', `$${(data?.estadisticas_precio?.maximo || 0).toLocaleString('es-ES')}`]
  ];
  
  autoTable(doc,{
    startY: 42,
    head: [resumenData[0]],
    body: resumenData.slice(1),
    theme: 'grid'
  });
  
  let currentY = doc.lastAutoTable.finalY;
  
  // Por tipo de operación
  if (data?.por_tipo_operacion && data.por_tipo_operacion.length > 0) {
    doc.setFontSize(12);
    doc.text('Por Tipo de Operación', 14, currentY + 10);
    
    const operacionData = [
      ['Tipo', 'Cantidad'],
      ...data.por_tipo_operacion.map(item => [item.tipo_operacion, item.total])
    ];
    
    autoTable(doc,{
      startY: currentY + 16,
      head: [operacionData[0]],
      body: operacionData.slice(1),
      theme: 'grid'
    });
    currentY = doc.lastAutoTable.finalY;
  }
  
  // Por estado
  if (data?.por_estado && data.por_estado.length > 0) {
    doc.setFontSize(12);
    doc.text('Por Estado', 14, currentY + 10);
    
    const estadoData = [
      ['Estado', 'Cantidad'],
      ...data.por_estado.map(item => [item.estado, item.total])
    ];
    
    autoTable(doc,{
      startY: currentY + 16,
      head: [estadoData[0]],
      body: estadoData.slice(1),
      theme: 'grid'
    });
  }
  
  doc.save(`reporte_inmuebles_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporta reporte de inmuebles a Excel
 */
export const exportarInmueblesExcel = (data, filtros) => {
  const wb = XLSX.utils.book_new();
  
  // Hoja 1: Resumen
  const resumenData = [
    ['REPORTE DE INMUEBLES'],
    [],
    ['Período', data?.periodo || 'N/A'],
    ['Total Inmuebles', data?.total_inmuebles || 0],
    ['Superficie Promedio', data?.superficie_promedio || 0],
    ['Precio Promedio', data?.estadisticas_precio?.promedio || 0],
    ['Precio Mínimo', data?.estadisticas_precio?.minimo || 0],
    ['Precio Máximo', data?.estadisticas_precio?.maximo || 0],
    [],
    ['DISTRIBUCIÓN POR TIPO DE OPERACIÓN']
  ];
  
  if (data?.por_tipo_operacion) {
    resumenData.push(['Tipo Operación', 'Cantidad']);
    data.por_tipo_operacion.forEach(item => {
      resumenData.push([item.tipo_operacion, item.total]);
    });
  }
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
  
  // Hoja 2: Por Estado
  if (data?.por_estado && data.por_estado.length > 0) {
    const estadoData = [
      ['Estado', 'Cantidad'],
      ...data.por_estado.map(item => [item.estado, item.total])
    ];
    
    const wsEstado = XLSX.utils.aoa_to_sheet(estadoData);
    XLSX.utils.book_append_sheet(wb, wsEstado, 'Por Estado');
  }
  
  // Hoja 3: Por Ciudad
  if (data?.por_ciudad && data.por_ciudad.length > 0) {
    const ciudadData = [
      ['Ciudad', 'Cantidad'],
      ...data.por_ciudad.map(item => [item.ciudad, item.total])
    ];
    
    const wsCiudad = XLSX.utils.aoa_to_sheet(ciudadData);
    XLSX.utils.book_append_sheet(wb, wsCiudad, 'Por Ciudad');
  }
  
  XLSX.writeFile(wb, `reporte_inmuebles_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporta reporte de contratos a PDF
 */
export const exportarContratosPDF = (data, filtros) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('REPORTE DE CONTRATOS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Período: ${data?.periodo || 'N/A'}`, 14, 30);
  
  const resumenData = [
    ['Métrica', 'Valor'],
    ['Total Contratos', data?.total_contratos || 0],
    ['Ingresos Totales', `$${(data?.ingresos?.total || 0).toLocaleString('es-ES')}`],
    ['Comisión Promedio', `$${(data?.ingresos?.promedio_por_contrato || 0).toLocaleString('es-ES')}`],
    ['Contratos Próximos a Vencer', data?.proximos_a_vencer || 0],
    ['Tasa de Conversión', `${data?.tasa_conversion || 0}%`]
  ];
  
  autoTable(doc,{
    startY: 36,
    head: [resumenData[0]],
    body: resumenData.slice(1),
    theme: 'grid'
  });
  
  let currentY = doc.lastAutoTable.finalY;
  
  // Por tipo de contrato
  if (data?.por_tipo_contrato && data.por_tipo_contrato.length > 0) {
    doc.setFontSize(12);
    doc.text('Por Tipo de Contrato', 14, currentY + 10);
    
    const tipoData = [
      ['Tipo', 'Cantidad'],
      ...data.por_tipo_contrato.map(item => [item.tipo_contrato, item.total])
    ];
    
    autoTable(doc,{
      startY: currentY + 16,
      head: [tipoData[0]],
      body: tipoData.slice(1),
      theme: 'grid'
    });
    currentY = doc.lastAutoTable.finalY;
  }
  
  // Comisiones por tipo
  if (data?.comisiones_por_tipo && data.comisiones_por_tipo.length > 0) {
    doc.setFontSize(12);
    doc.text('Comisiones por Tipo', 14, currentY + 10);
    
    const comisionesData = [
      ['Tipo', 'Total', 'Promedio', 'Cantidad'],
      ...data.comisiones_por_tipo.map(item => [
        item.tipo_contrato,
        `$${(item.total || 0).toLocaleString('es-ES')}`,
        `$${(item.promedio || 0).toLocaleString('es-ES')}`,
        item.cantidad
      ])
    ];
    
    autoTable(doc,{
      startY: currentY + 16,
      head: [comisionesData[0]],
      body: comisionesData.slice(1),
      theme: 'grid'
    });
  }
  
  doc.save(`reporte_contratos_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporta reporte de contratos a Excel
 */
export const exportarContratosExcel = (data, filtros) => {
  const wb = XLSX.utils.book_new();
  
  // Hoja 1: Resumen
  const resumenData = [
    ['REPORTE DE CONTRATOS'],
    [],
    ['Período', data?.periodo || 'N/A'],
    ['Total Contratos', data?.total_contratos || 0],
    ['Ingresos Totales', data?.ingresos?.total || 0],
    ['Comisión Promedio', data?.ingresos?.promedio_por_contrato || 0],
    ['Próximos a Vencer', data?.proximos_a_vencer || 0],
    ['Tasa de Conversión', data?.tasa_conversion || 0],
    [],
    ['CONTRATOS POR TIPO']
  ];
  
  if (data?.por_tipo_contrato) {
    resumenData.push(['Tipo Contrato', 'Cantidad']);
    data.por_tipo_contrato.forEach(item => {
      resumenData.push([item.tipo_contrato, item.total]);
    });
  }
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
  
  // Hoja 2: Comisiones
  if (data?.comisiones_por_tipo && data.comisiones_por_tipo.length > 0) {
    const comisionesData = [
      ['Tipo Contrato', 'Total Comisiones', 'Comisión Promedio', 'Cantidad'],
      ...data.comisiones_por_tipo.map(item => [
        item.tipo_contrato,
        item.total,
        item.promedio,
        item.cantidad
      ])
    ];
    
    const wsComisiones = XLSX.utils.aoa_to_sheet(comisionesData);
    XLSX.utils.book_append_sheet(wb, wsComisiones, 'Comisiones');
  }
  
  // Hoja 3: Top Agentes
  if (data?.top_agentes && data.top_agentes.length > 0) {
    const agentesData = [
      ['Agente', 'Total Comisiones', 'Cantidad Contratos'],
      ...data.top_agentes.map(item => [
        item.agente,
        item.total_comisiones,
        item.cantidad_contratos
      ])
    ];
    
    const wsAgentes = XLSX.utils.aoa_to_sheet(agentesData);
    XLSX.utils.book_append_sheet(wb, wsAgentes, 'Top Agentes');
  }
  
  XLSX.writeFile(wb, `reporte_contratos_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporta reporte de agentes a PDF
 */
export const exportarAgentesPDF = (data, filtros) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('REPORTE DE DESEMPEÑO - AGENTES', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Período: ${data?.periodo || 'N/A'}`, 14, 30);
  
  // Totales generales
  const totalesData = [
    ['Métrica', 'Valor'],
    ['Total Agentes', data?.totales?.total_agentes || 0],
    ['Total Inmuebles', data?.totales?.total_inmuebles || 0],
    ['Total Contratos', data?.totales?.total_contratos || 0],
    ['Total Comisiones', `$${(data?.totales?.total_comisiones || 0).toLocaleString('es-ES')}`]
  ];
  
  autoTable(doc,{
    startY: 36,
    head: [totalesData[0]],
    body: totalesData.slice(1),
    theme: 'grid'
  });
  
  // Top 10 agentes
  if (data?.agentes && data.agentes.length > 0) {
    doc.setFontSize(12);
    doc.text('Top Agentes por Comisiones', 14, doc.lastAutoTable.finalY + 10);
    
    const agentesData = [
      ['Agente', 'Contratos', 'Comisiones', 'Conversión %'],
      ...data.agentes.slice(0, 10).map(agente => [
        agente.nombre,
        agente.contratos?.cerrados || 0,
        `$${(agente.comisiones_generadas || 0).toLocaleString('es-ES')}`,
        `${agente.tasa_conversion || 0}%`
      ])
    ];
    
    autoTable(doc,{
      startY: doc.lastAutoTable.finalY + 16,
      head: [agentesData[0]],
      body: agentesData.slice(1),
      theme: 'grid',
      styles: { fontSize: 8 }
    });
  }
  
  doc.save(`reporte_agentes_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporta reporte de agentes a Excel
 */
export const exportarAgentesExcel = (data, filtros) => {
  const wb = XLSX.utils.book_new();
  
  // Hoja 1: Resumen
  const resumenData = [
    ['REPORTE DE AGENTES'],
    [],
    ['Período', data?.periodo || 'N/A'],
    ['Total Agentes', data?.totales?.total_agentes || 0],
    ['Total Inmuebles', data?.totales?.total_inmuebles || 0],
    ['Total Contratos', data?.totales?.total_contratos || 0],
    ['Total Comisiones', data?.totales?.total_comisiones || 0],
    [],
    ['DETALLE POR AGENTE']
  ];
  
  if (data?.agentes) {
    resumenData.push([
      'Agente',
      'Inmuebles Publicados',
      'Inmuebles Aprobados',
      'Contratos Cerrados',
      'Comisiones',
      'Tasa Conversión %'
    ]);
    
    data.agentes.forEach(agente => {
      resumenData.push([
        agente.nombre,
        agente.inmuebles?.publicados || 0,
        agente.inmuebles?.aprobados || 0,
        agente.contratos?.cerrados || 0,
        agente.comisiones_generadas || 0,
        agente.tasa_conversion || 0
      ]);
    });
  }
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Agentes');
  
  XLSX.writeFile(wb, `reporte_agentes_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporta reporte financiero a PDF
 */
export const exportarFinancieroPDF = (data, filtros) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('REPORTE FINANCIERO', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Período: ${data?.periodo || 'N/A'}`, 14, 30);
  
  const resumenData = [
    ['Métrica', 'Valor'],
    ['Total Comisiones', `$${(data?.total_comisiones || 0).toLocaleString('es-ES')}`],
    ['Proyección Ingresos Activos', `$${(data?.proyeccion_ingresos_activos || 0).toLocaleString('es-ES')}`]
  ];
  
  autoTable(doc,{
    startY: 36,
    head: [resumenData[0]],
    body: resumenData.slice(1),
    theme: 'grid'
  });
  
  let currentY = doc.lastAutoTable.finalY;
  
  // Comisiones por tipo
  if (data?.comisiones_por_tipo && data.comisiones_por_tipo.length > 0) {
    doc.setFontSize(12);
    doc.text('Comisiones por Tipo', 14, currentY + 10);
    
    const comisionesData = [
      ['Tipo', 'Total', 'Cantidad'],
      ...data.comisiones_por_tipo.map(item => [
        item.tipo,
        `$${(item.total || 0).toLocaleString('es-ES')}`,
        item.cantidad
      ])
    ];
    
    autoTable(doc,{
      startY: currentY + 16,
      head: [comisionesData[0]],
      body: comisionesData.slice(1),
      theme: 'grid'
    });
    currentY = doc.lastAutoTable.finalY;
  }
  
  // Top agentes
  if (data?.top_10_agentes && data.top_10_agentes.length > 0) {
    doc.setFontSize(12);
    doc.text('Top 10 Agentes', 14, currentY + 10);
    
    const agentesData = [
      ['Agente', 'Total Comisiones', 'Cantidad'],
      ...data.top_10_agentes.map(item => [
        item.agente,
        `$${(item.total || 0).toLocaleString('es-ES')}`,
        item.cantidad
      ])
    ];
    
    autoTable(doc,{
      startY: currentY + 16,
      head: [agentesData[0]],
      body: agentesData.slice(1),
      theme: 'grid'
    });
  }
  
  doc.save(`reporte_financiero_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporta reporte financiero a Excel con múltiples hojas
 */
export const exportarFinancieroExcel = (data, filtros) => {
  const wb = XLSX.utils.book_new();
  
  // Hoja 1: Resumen
  const resumenData = [
    ['REPORTE FINANCIERO'],
    [],
    ['Período', data?.periodo || 'N/A'],
    ['Total Comisiones', data?.total_comisiones || 0],
    ['Proyección Ingresos Activos', data?.proyeccion_ingresos_activos || 0],
    [],
    ['COMISIONES POR TIPO DE CONTRATO'],
    ['Tipo', 'Total', 'Cantidad'],
    ...(data?.comisiones_por_tipo || []).map(item => [
      item.tipo,
      item.total,
      item.cantidad
    ])
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
  
  // Hoja 2: Evolución Temporal
  if (data?.evolucion_temporal && data.evolucion_temporal.length > 0) {
    const evolucionData = [
      ['Período', 'Comisiones', 'Contratos'],
      ...data.evolucion_temporal.map(item => [
        item.periodo,
        item.total_comisiones,
        item.cantidad_contratos
      ])
    ];
    
    const wsEvolucion = XLSX.utils.aoa_to_sheet(evolucionData);
    XLSX.utils.book_append_sheet(wb, wsEvolucion, 'Evolución Temporal');
  }
  
  // Hoja 3: Top Agentes
  if (data?.top_10_agentes && data.top_10_agentes.length > 0) {
    const agentesData = [
      ['Agente', 'Total Comisiones', 'Cantidad Contratos'],
      ...data.top_10_agentes.map(item => [
        item.agente,
        item.total,
        item.cantidad
      ])
    ];
    
    const wsAgentes = XLSX.utils.aoa_to_sheet(agentesData);
    XLSX.utils.book_append_sheet(wb, wsAgentes, 'Top Agentes');
  }
  
  XLSX.writeFile(wb, `reporte_financiero_${new Date().toISOString().split('T')[0]}.xlsx`);
};