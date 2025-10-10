import { useContext } from 'react'
import { ChatContext } from '../../contexts/ChatContext'

export default function ChatList({ onSelectChat, userId, selectedChatId }) {
  const { chats } = useContext(ChatContext)

  return (
    <div className='w-80 border-r border-stone-200 overflow-y-auto h-full bg-stone-50'>
      <h2 className='p-4 text-lg font-semibold border-b border-stone-200 text-stone-900'>
        Chats
      </h2>

      {chats.length === 0 ? (
        <p className='p-4 text-stone-500'>No hay chats aún</p>
      ) : (
        chats.map((chat) => {
          const otherUser =
            chat.cliente.id === userId ? chat.agente : chat.cliente
          const lastMsg = chat.mensajes[chat.mensajes.length - 1]
          const lastMsgTime = lastMsg
            ? new Date(lastMsg.fecha_envio).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })
            : ''

          const isMine = lastMsg?.usuario_id === userId
          const lastMsgText = lastMsg
            ? `${isMine ? 'Tu: ' : ''}${lastMsg.mensaje}`
            : 'Sin mensajes aún'

          const unreadCount = chat.mensajes.filter(
            (msg) => !msg.leido && msg.usuario_id !== userId
          ).length

          return (
            <div
              key={chat.id}
              className={`flex items-center p-4 cursor-pointer border-b border-stone-200 relative hover:bg-stone-100 ${
                selectedChatId === chat.id ? 'bg-stone-100' : ''
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              {/* Avatar circular */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold mr-3 ${
                  unreadCount > 0
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-400 text-stone-100'
                }`}
              >
                {otherUser.nombre[0]?.toUpperCase()}
              </div>

              {/* Contenido del chat */}
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-stone-900 truncate'>
                  {otherUser.nombre}
                </p>
                <p
                  className={`text-xs truncate ${
                    unreadCount > 0
                      ? 'text-stone-900 font-bold'
                      : 'text-stone-500'
                  }`}
                >
                  {lastMsgText}
                </p>
              </div>

              {/* Hora del último mensaje */}
              {lastMsgTime && (
                <div
                  className={`flex-shrink-0 text-xs ml-2 ${
                    unreadCount > 0
                      ? 'text-stone-900 font-semibold'
                      : 'text-stone-500'
                  }`}
                >
                  {lastMsgTime}
                </div>
              )}

              {/* Badge con número de mensajes no leídos */}
              {unreadCount > 0 && (
                <div className='absolute top-2 right-2 min-w-[18px] h-4 bg-stone-900 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1'>
                  {unreadCount}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
