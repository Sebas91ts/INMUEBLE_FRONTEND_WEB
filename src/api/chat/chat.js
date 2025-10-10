import instancia from '../axios';

export const createChat = async (data) => {
    console.log("datos a enviar",data)
    return instancia.post('contacto/chats/', data);
}

// Obtener todos los chats del usuario logueado
export const getChats = async () => {
  try {
    const res = await instancia.get('contacto/chats/');
    console.log("res del api: ",res)
    return res.data.values || []; // asumimos que la lista viene en values
  } catch (error) {
    console.error('Error al obtener chats:', error);
    return [];
  }
};

// Obtener mensajes de un chat específico
export const getMensajes = async (chatId) => {
  try {
    const res = await instancia.get(`contacto/chats/${chatId}/mensajes/`);
    console.log("res del api msg: ",res)
    return res.data.values || [];
  } catch (error) {
    console.error(`Error al obtener mensajes del chat ${chatId}:`, error);
    return [];
  }
};
// Marcar un mensaje como leído
export const marcarMensajeLeido = async (mensajeIds = []) => {
  if (!mensajeIds.length) return null;

  try {
    const res = await instancia.post('contacto/mensaje/marcar-leidos/', {
      mensaje_ids: mensajeIds
    });
    console.log("Mensajes marcados como leídos:", res.data);
    return res.data;
  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
    return null;
  }
};