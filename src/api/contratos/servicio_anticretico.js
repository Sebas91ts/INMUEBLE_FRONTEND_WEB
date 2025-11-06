import instancia from "../axios";

export const descargarContratoServiciosAnticretico = async (data) => {
    const response = await instancia.post('/contrato/generarContratoDeServiciosAnticreticoPdf', data, {
      responseType: 'blob'
    })
    return response
}