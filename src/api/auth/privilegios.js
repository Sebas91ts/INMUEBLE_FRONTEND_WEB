import instancia from "../axios";

export const getPrivilegios = async (token) => {
  return instancia.get('usuario/get_privilegios', {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
};
