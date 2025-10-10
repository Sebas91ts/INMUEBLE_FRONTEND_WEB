// src/pages/Chat/ChatPage.jsx
import { useState, useContext, useEffect } from 'react'
import ChatList from './ChatList'
import ChatRoom from './ChatRoom'
import { useAuth } from '../../hooks/useAuth'
import { ChatContext } from '../../contexts/ChatContext'
import { useLocation } from 'react-router-dom'

export default function ChatPage() {
  const { user } = useAuth()
  const { chats, enviarMensaje } = useContext(ChatContext)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const location = useLocation()

  // Leer chatId de la URL si existe
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const chatIdFromUrl = params.get('chatId')
    if (chatIdFromUrl) setSelectedChatId(Number(chatIdFromUrl))
  }, [location.search])
  // Encontrar el chat completo según el ID seleccionado
  const selectedChat = chats.find((c) => c.id === selectedChatId) || null

  return (
    <div className='flex h-[calc(100vh-4rem)]'>
      <ChatList
        onSelectChat={setSelectedChatId}
        userId={user?.id}
        selectedChatId={selectedChatId}
      />
      <ChatRoom chat={selectedChat} user={user} enviarMensaje={enviarMensaje} />
    </div>
  )
}
