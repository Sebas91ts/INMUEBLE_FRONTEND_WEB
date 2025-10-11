import { createContext, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getChats, getMensajes } from '../api/chat/chat'

export const ChatContext = createContext()

const BaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export function ChatProvider({ children }) {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState(null)
  const [chats, setChats] = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)

  // Cargar chats
  useEffect(() => {
    if (!user || !token) return

    async function loadChats() {
      try {
        const chatsApi = await getChats()
        const chatsData = await Promise.all(
          chatsApi.map(async (chat) => {
            const msgRes = await getMensajes(chat.id)
            const mensajes = (msgRes || []).map((msg) => ({
              ...msg,
              usuario_id: msg.usuario?.id,
              usuario_nombre: msg.usuario?.nombre,
              leido: msg.leido || false
            }))
            return {
              ...chat,
              mensajes,
              lastMessage: mensajes.length > 0 ? mensajes[mensajes.length - 1].mensaje : null,
              unreadCount: mensajes.filter((m) => !m.leido && m.usuario_id !== user.id).length
            }
          })
        )
        setChats(chatsData)
      } catch (err) {
        console.error('Error cargando chats', err)
      }
    }

    loadChats()
  }, [user, token])

  // WebSocket
  useEffect(() => {
    if (!user || !token) return

    const ws = new WebSocket(
      `${BaseUrl.replace(/^http/, 'ws')}/ws/user/${user.id}/?token=${token}`
    )

    ws.onopen = () => console.log('[WS] Conectado')
    ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  console.log('[WS] Mensaje recibido en React:', msg)

  // ⚡ CORREGIDO: Mejor detección de mensajes y evitar duplicados
  if (msg.chat_id && msg.mensaje && msg.usuario_id) {
    
    // ⚡ EVITAR PROCESAR MENSAJES PROPIOS DEL WEBSOCKET
    // (ya se agregaron localmente al enviar)
    if (msg.usuario_id === user.id) {
      console.log('🔄 Mensaje propio del WS, ignorando...')
      return
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === msg.chat_id) {
          const isCurrentChat = chat.id === selectedChatId
          const nuevoMensaje = {
            id: Date.now(), // ID temporal
            mensaje: msg.mensaje,
            usuario_id: msg.usuario_id,
            usuario_nombre: msg.usuario_nombre,
            fecha_envio: msg.fecha_envio,
            leido: isCurrentChat
          }

          // ⚡ MEJOR DEDUPLICACIÓN
          const mensajeExiste = chat.mensajes.some(m => 
            m.mensaje === nuevoMensaje.mensaje && 
            m.usuario_id === nuevoMensaje.usuario_id &&
            Math.abs(new Date(m.fecha_envio) - new Date(nuevoMensaje.fecha_envio)) < 30000 // 30 segundos
          )

          if (!mensajeExiste) {
            console.log('✅ Agregando mensaje NUEVO al chat:', nuevoMensaje)
            return {
              ...chat,
              mensajes: [...chat.mensajes, nuevoMensaje],
              lastMessage: nuevoMensaje.mensaje,
              unreadCount: isCurrentChat ? 0 : (chat.unreadCount || 0) + 1
            }
          } else {
            console.log('🔄 Mensaje duplicado, ignorando')
            return chat
          }
        }
        return chat
      })
    )
  }
}

    ws.onclose = () => console.log('[WS] Cerrado')
    ws.onerror = (err) => console.log('[WS] Error', err)

    setSocket(ws)
    return () => ws.close()
  }, [user?.id, token, selectedChatId])

const enviarMensaje = (chat_id, mensaje) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    // ⚡ ENVIAR FORMATO COMPATIBLE
    const mensajeCompleto = {
      chat_id,
      mensaje,
      usuario_id: user.id,
      usuario_nombre: user.nombre,
      fecha_envio: new Date().toISOString()
    }
    
    socket.send(JSON.stringify(mensajeCompleto))
    console.log(`📤 Mensaje enviado:`, mensajeCompleto)
    
    // ⚡ AGREGAR LOCALMENTE SOLO UNA VEZ
    setChats(prev =>
      prev.map(chat => {
        if (chat.id === chat_id) {
          const nuevoMensaje = {
            id: -Date.now(), // ID negativo para diferenciar
            mensaje,
            usuario_id: user.id,
            usuario_nombre: user.nombre,
            fecha_envio: new Date().toISOString(),
            leido: true
          }
          
          // Verificar que no exista ya
          const yaExiste = chat.mensajes.some(m => m.id === nuevoMensaje.id)
          if (!yaExiste) {
            return {
              ...chat,
              mensajes: [...chat.mensajes, nuevoMensaje],
              lastMessage: mensaje
            }
          }
        }
        return chat
      })
    )
  } else {
    console.error('❌ WebSocket no conectado')
  }
}

  // Función para marcar mensajes como leídos
  const marcarMensajesLeidos = (mensajeIds, chatId) => {
    setChats(prev =>
      prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            mensajes: chat.mensajes.map(msg =>
              mensajeIds.includes(msg.id) ? { ...msg, leido: true } : msg
            ),
            unreadCount: 0
          }
        }
        return chat
      })
    )
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        enviarMensaje,
        selectedChatId,
        setSelectedChatId,
        marcarMensajesLeidos // ⬅️ AÑADIR esta función
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}