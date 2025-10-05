import instancia from "../axios";

//ESTO ES UN EJEMPLO HAY QUE CAMBIAR

export const getUsuarios = async () => {
    return instancia.get('usuario/mostrarUsuarios/');  
}

// export const getBitacora = async () => {
//     return instancia.get('usuario/bitacora/');  
// }

