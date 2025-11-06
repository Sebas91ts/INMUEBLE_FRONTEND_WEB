import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { useChatBot } from '../hooks/useChatBot'; // Importa el hook que creamos
import './chatbot.css'; // Importa los estilos

// Componente de Botón simple, con el focus ring azul
const SimpleButton = ({ onClick, children, className = '', ...props }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors 
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 
                disabled:opacity-50 disabled:pointer-events-none 
                ${className}`}
    {...props}
  >
    {children}
  </button>
);

export function ChatBot({ className = '' }) {
  const {
    messages,
    isTyping,
    isOpen,
    isMinimized,
    sendMessage,
    toggleOpen,
    toggleMinimized,
    close
  } = useChatBot();

  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    const messageToSend = currentMessage;
    setCurrentMessage('');
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Acciones rápidas con emojis reducidos
// Reemplaza el array 'quickActions' existente por este:

  const quickActions = [
    { label: 'Ayuda (Cliente)', message: 'ayuda cliente', icon: '🏠' },
    { label: 'Ayuda (Agente)', message: 'ayuda agente', icon: '📝' },
    { label: 'Ayuda (Admin)', message: 'ayuda admin', icon: '⚙️' },
    { label: '¿Cómo busco?', message: 'Cómo busco propiedades', icon: '🔎' }
  ];

  const handleQuickAction = async (message) => {
    await sendMessage(message);
  };

  // --- Botón flotante (Estilo Azul) ---
  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="relative group">
          <SimpleButton
            onClick={toggleOpen}
            className="chatbot-float rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-500 group-hover:scale-110 text-white"
          >
            <Bot className="h-7 w-7" />
          </SimpleButton>
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-stone-900 text-white text-sm py-2 px-3 rounded-lg whitespace-nowrap">
              ¿Necesitas ayuda? ¡Pregúntame!
              <div className="absolute top-full right-4 w-2 h-2 bg-stone-900 transform rotate-45"></div>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      </div>
    );
  }

  // --- Ventana del Chat (Estilo Azul y Stone) ---
  return (
    <div className={`fixed bottom-6 right-6 z-50 chatbot-container ${className}`}>
      <div className={`w-96 shadow-2xl transition-all duration-300 chatbot-slide-up ${isMinimized ? 'h-16 chatbot-minimized' : 'h-[600px]'} bg-white rounded-lg overflow-hidden flex flex-col border border-stone-200`}>
        
        {/* Cabecera del Chat (Estilo Azul) */}
        <div className="flex flex-row items-center justify-between py-3 px-4 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                Asistente Virtual
              </h3>
              <p className="text-xs text-blue-100">Inmobiliaria</p>
            </div>
            <span className="bg-white text-blue-600 py-0.5 px-2 rounded-full text-xs font-semibold">
              En línea
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <SimpleButton
              onClick={toggleMinimized}
              className="h-8 w-8 p-0 text-white hover:bg-blue-500 rounded-full"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </SimpleButton>
            <SimpleButton
              onClick={close}
              className="h-8 w-8 p-0 text-white hover:bg-blue-500 rounded-full"
            >
              <X className="h-4 w-4" />
            </SimpleButton>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-0 flex flex-col h-[calc(600px-4rem)]">
            
            {/* Área de Mensajes (Fondo Stone) */}
            <div className="flex-1 p-4 overflow-y-auto chatbot-scrollarea bg-stone-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[85%]`}>
                      {/* Avatar del Bot (Estilo Azul) */}
                      {message.sender === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border-2 border-blue-200">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      {/* Burbuja de Mensaje (Estilo Stone y Azul) */}
                      <div
                        className={`rounded-lg px-3 py-2 chatbot-message shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white' // Mensaje de Usuario
                            : 'bg-white text-stone-800 border border-stone-200' // Mensaje de Bot
                        }`}
                      >
                        <div className="text-sm whitespace-pre-line leading-relaxed"
                             dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }} />
                        <div className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-stone-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {/* Avatar de Usuario (Estilo Stone) */}
                      {message.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-stone-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Indicador de "Escribiendo..." (Estilo Bot Azul) */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 border border-stone-200 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full chatbot-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full chatbot-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full chatbot-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Acciones Rápidas (Estilo Botones Secundarios) */}
            <div className="p-3 border-t border-stone-200 bg-stone-50">
              <div className="text-xs text-stone-600 mb-2 font-medium">Acciones rápidas:</div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <SimpleButton
                    key={index}
                    onClick={() => handleQuickAction(action.message)}
                    className="text-xs h-8 px-2 chatbot-quick-action bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-blue-500"
                    disabled={isTyping}
                  >
                    <span className="mr-1.5">{action.icon}</span>
                    {action.label}
                  </SimpleButton>
                ))}
              </div>
            </div>

            {/* Área de Input (Estilo Barra de Búsqueda) */}
            <div className="p-4 border-t border-stone-200 bg-white">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 w-full rounded-md border border-stone-300 bg-stone-50 py-2 px-3 text-sm text-stone-900 ring-0 transition placeholder:text-stone-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isTyping}
                />
                <SimpleButton
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md"
                >
                  <Send className="h-4 w-4" />
                </SimpleButton>
              </div>
              <div className="text-xs text-stone-500 mt-2 flex items-center justify-between">
                <span>Presiona Enter para enviar</span>
                <span className="text-blue-600 font-medium">Conversación Segura</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatBot;