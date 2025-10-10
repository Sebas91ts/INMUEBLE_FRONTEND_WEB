import { useState, useEffect, useRef, useContext } from 'react'
import LoginRequired from '../../components/LoginRequired'
import { ChatContext } from '../../contexts/ChatContext'

export default function ChatRoom({ chat, user, enviarMensaje }) {
  const { marcarMensajesLeidos } = useContext(ChatContext)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  // Siempre definir chatMessages aunque chat sea null
  const chatMessages = chat?.mensajes ?? []
  const otherUser =
    chat?.cliente?.id === user?.id ? chat?.agente : chat?.cliente

  // Scroll al final y marcar mensajes leídos
  useEffect(() => {
    if (!chat || !user) return

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

    // Filtramos solo los mensajes que no están leídos y no son míos
    const mensajesNoLeidos = chatMessages
      .filter((msg) => !msg.leido && msg.usuario_id !== user.id)
      .map((msg) => msg.id)

    if (mensajesNoLeidos.length > 0) {
      marcarMensajesLeidos(mensajesNoLeidos, chat.id)
    }
  }, [chatMessages, chat, user, marcarMensajesLeidos])

  const handleSend = () => {
    if (!input.trim() || !chat) return
    enviarMensaje(chat.id, input)
    setInput('')
  }

  if (!user) return <LoginRequired />
  if (!chat)
    return (
      <div className='flex-1 flex items-center justify-center text-stone-500'>
        Selecciona un chat
      </div>
    )

  return (
    <div className='flex-1 flex flex-col h-full border-l border-stone-200 bg-stone-50'>
      {/* Header */}
      <div className='p-4 border-b border-stone-200 flex items-center gap-3 bg-stone-100'>
        <div className='w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-semibold'>
          {otherUser?.nombre[0]?.toUpperCase()}
        </div>
        <p className='font-semibold text-stone-900'>{otherUser?.nombre}</p>
      </div>

      {/* Mensajes */}
      <div className='flex-1 overflow-y-auto p-4 space-y-2'>
        {chatMessages.map((msg) => {
          const isMe = msg.usuario_id === user.id
          return (
            <div
              key={msg.id}
              className={`p-2 rounded-md max-w-xs break-words ${
                isMe
                  ? 'bg-stone-900 text-white ml-auto'
                  : 'bg-stone-100 text-stone-900'
              }`}
            >
              <p className='text-sm'>{msg.mensaje}</p>
              <p className='text-xs text-stone-400 text-right'>
                {new Date(msg.fecha_envio).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )
        })}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div className='p-4 border-t border-stone-200 flex gap-2 bg-stone-100'>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Escribe un mensaje...'
          className='flex-1 border border-stone-300 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900'
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className='bg-stone-900 text-white px-4 py-2 rounded-full hover:bg-stone-800'
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
