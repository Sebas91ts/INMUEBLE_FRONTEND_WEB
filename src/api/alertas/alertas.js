// src/api/alertas/alertas.js
// 🟢 FUNCIÓN FALTANTE PARA EL CRON JOB
export const correrScan = async () => {
    // POST /alertas/ejecutar-generacion/
    // Ejecuta la lógica del cron job en el backend
    return instancia.post('alertas/ejecutar-generacion/');
}
import instancia from "../axios"; 

export const getMisAlertas = async () => {
    return instancia.get('alertas/listar-mis-alertas/');  
}

export const marcarAlertaComoVista = async (alertId) => {
    return instancia.patch(`alertas/marcar-visto/${alertId}/`, { estado_visto: 'visto' });
}

export const descartarAlerta = async (alertId) => {
    return instancia.patch(`alertas/marcar-visto/${alertId}/`, { estado_visto: 'descartado' });
}

export const enviarAvisoInmediato = async (data) => {
    return instancia.post('alertas/aviso-inmediato/', data);
}
export const listarAlertasAdmin = async (params = {}) => {
    // envía params como query string: /alertas/listar-admin/?estado=pendiente
    return instancia.get('alertas/listar-admin/', { params });
}
