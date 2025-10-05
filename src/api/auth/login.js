import instancia from "../axios";

export const login = async (username, password) => {
    return instancia.post('usuario/login/', { username, password });  
}

export const register = async (
  username,
  password,
  nombre,
  correo,
  ci,
  telefono,
  ubicacion,
  fecha_nacimiento
) => {
  return instancia.post('usuario/register', {
    username,
    password,
    nombre,
    correo,
    ci,
    telefono,
    ubicacion,
    fecha_nacimiento
  })
}