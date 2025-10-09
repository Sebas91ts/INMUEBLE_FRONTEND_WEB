import instancia from "../axios";

export const login = async (username, password) => {
    return instancia.post('usuario/login/', { username, password });  
}

export const register = async (payload) => {
  return instancia.post('usuario/register', payload)
}
