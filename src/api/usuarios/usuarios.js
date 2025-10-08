import instancia from "../axios";

//ESTO ES UN EJEMPLO HAY QUE CAMBIAR

export const getUsuarios = async () => {
    return instancia.get('usuario/mostrarUsuarios/');  
}

export const leerBitacora = async (llave) => {
  return instancia.post('usuario/leer_bitacora/', { llave });
};
// export const getBitacora = async () => {
//     return instancia.get('usuario/bitacora/');  
// }

