//src/api/usuarios/usuarios.js
import instancia from "../axios";

//ESTO ES UN EJEMPLO HAY QUE CAMBIAR

export const getUsuarios = async () => {
    return instancia.get('usuario/listar_usuarios');  
}

export const leerBitacora = async (llave) => {
  return instancia.post('usuario/leer_bitacora/', { llave });
};
// export const getBitacora = async () => {
//     return instancia.get('usuario/bitacora/');  
// }
export const getSolicitudes = async () => {
  return instancia.get('usuario/solicitudes-agentes');  
}
export const cambiarEstadoSolicitud = async (id, estado) => {
  return instancia.patch(`usuario/solicitudes-agentes/${id}/estado`, { estado });
}
export const descargarContratoAgente = async (data) => {
  return instancia.post('usuario/generarContratoPdf', data);
}
export const updateUsuario = async (id, data) => {
  return instancia.patch(`usuario/editar_usuario/${id}`, data);
}
export const eliminarUsuario = async (id) => {
  return instancia.delete(`usuario/eliminar_usuario/${id}`);
}
export const activarUsuario = async (id) => {
  return instancia.patch(`usuario/activar_usuario/${id}`);
}
export const getAgentes = async () => {
  return instancia.get('usuario/listar-agentes');  
}