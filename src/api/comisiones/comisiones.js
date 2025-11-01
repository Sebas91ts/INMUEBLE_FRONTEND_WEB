import instancia from "../axios"

export const getDashboardComisiones = (params = {}) => {
  return instancia.get('contrato/comisiones/dashboard', { params })
}

export const getDetalleComisionesAgente = (agenteId, params = new URLSearchParams()) => {
  return instancia.get(`contrato/comisiones/agente/${agenteId}?${params.toString()}`)
}