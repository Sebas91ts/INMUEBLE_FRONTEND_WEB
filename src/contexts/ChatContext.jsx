import { createContext, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  getChats,
  getMensajes,
  marcarMensajeLeido as apiMarcarMensajeLeido
} from '../api/chat/chat'

export const ChatContext = createContext()

const BaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/'

export function ChatProvider({ children }) {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState(null)
  const [chats, setChats] = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)

  // Cargar chats y mensajes
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
              lastMessage:
                mensajes.length > 0
                  ? mensajes[mensajes.length - 1].mensaje
                  : null,
              unreadCount: mensajes.filter((m) => !m.leido).length
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

  // WebSocket para mensajes en tiempo real
  useEffect(() => {
    if (!user || !token) return

    const ws = new WebSocket(
      `${BaseUrl.replace(/^http/, 'ws')}ws/user/${user.id}/?token=${token}`
    )

    ws.onopen = () => console.log('[WS] Conectado')
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      console.log('[WS] Mensaje recibido', msg)

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === msg.chat_id) {
            const isCurrentChat = chat.id === selectedChatId
            return {
              ...chat,
              mensajes: [
                ...chat.mensajes,
                {
                  ...msg,
                  usuario_id: msg.usuario_id || msg.usuario?.id,
                  usuario_nombre: msg.usuario_nombre || msg.usuario?.nombre,
                  leido: isCurrentChat // marcar automáticamente si el chat está abierto
                }
              ],
              lastMessage: msg.mensaje,
              unreadCount: isCurrentChat ? 0 : (chat.unreadCount || 0) + 1
            }
          }
          return chat
        })
      )
    }

    ws.onclose = () => console.log('[WS] Cerrado')
    ws.onerror = (err) => console.log('[WS] Error', err)

    setSocket(ws)
    return () => ws.close()
  }, [user?.id, token, selectedChatId])

  const enviarMensaje = (chat_id, mensaje) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ chat_id, mensaje }))
    }
  }

  // Marcar uno o varios mensajes como leídos
  const marcarMensajesLeidos = async (mensajeIds = [], chatId) => {
    if (!mensajeIds.length) return

    try {
      await apiMarcarMensajeLeido(mensajeIds) // enviamos un arreglo
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            const mensajes = chat.mensajes.map((msg) =>
              mensajeIds.includes(msg.id) ? { ...msg, leido: true } : msg
            )
            return {
              ...chat,
              mensajes,
              unreadCount: mensajes.filter((m) => !m.leido).length
            }
          }
          return chat
        })
      )
    } catch (err) {
      console.error('Error marcando mensajes como leídos:', err)
    }
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        enviarMensaje,
        selectedChatId,
        setSelectedChatId,
        marcarMensajesLeidos
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
