// src/hooks/useChatBot.js

import { useState, useCallback } from 'react';

// --- Base de Conocimiento para la INMOBILIARIA (basada en tus rutas) ---
const KNOWLEDGE_BASE = {
  // --- REEMPLAZOS (Mejorados) ---

  propiedades: {
    keywords: ['propiedades', 'casas', 'departamentos', 'lotes', 'comprar', 'ver', 'lista', 'buscar', 'catálogo', '/home/propiedades'],
    responses: [
      `Puedes buscar propiedades de varias formas:

1.  **Catálogo General:** Ve todas las propiedades filtradas en: /home/propiedades
2.  **Búsqueda Inteligente:** Usa la barra de búsqueda principal en la página de Inicio para describir lo que buscas (Ej: "Casa con 3 dormitorios").`
    ]
  },
  chat: {
    keywords: ['mis mensajes', 'contactar agente', 'hablar con', '/home/chat'],
    responses: [
      `Puedes chatear directamente con otros usuarios o agentes desde tu página de Mensajes.

➡️ **Ir a mis Mensajes:** /home/chat`
    ]
  },
  permisos: {
    keywords: ['permisos', 'roles', 'grupos', 'privilegios', 'componentes', 'seguridad', 'módulos'],
    responses: [
      `La configuración de seguridad avanzada (roles, grupos y permisos por componente) se encuentra en la sección de Permisos.

• **Gestionar Grupos:** /dashboard/permisos/grupos
• **Gestionar Privilegios:** /dashboard/permisos/privilegios
• **Gestionar Módulos:** /dashboard/permisos/componentes`
    ]
  },
  solicitudes: {
    keywords: ['solicitudes', 'aprobar agente', 'nuevos agentes', 'aprobar inmueble', 'solicitud-inmueble', 'solicitud-agente'],
    responses: [
      `Puedes aprobar o rechazar nuevas solicitudes en estas secciones:

• **Solicitudes de Agentes:** /dashboard/solicitud-agente
• **Solicitudes de Inmuebles:** /dashboard/solicitud-inmueble`
    ]
  },

  // --- Secciones Originales (limpiadas) ---

  propiedad_detalle: {
    keywords: ['detalle', 'específico', 'info de una casa', 'cuánto cuesta'],
    responses: [
      `Para ver el detalle de una propiedad (precio, fotos, ubicación, etc.), simplemente haz clic sobre ella en el catálogo.

Si tienes el ID, puedes ir a /propiedades/[id-de-la-propiedad]`
    ]
  },
  mis_inmuebles: {
    keywords: ['mis inmuebles', 'mis publicaciones', 'publicar', 'crear inmueble', 'historial', 'subir casa'],
    responses: [
      `Como agente, puedes gestionar tus propiedades desde tu panel.

**¿Qué quieres hacer?**
• **Crear nueva publicación:** /mis-inmuebles/crear
• **Ver mis publicaciones activas:** /mis-inmuebles/aprobados
• **Ver historial de publicaciones:** /mis-inmuebles/historial

¿Necesitas ayuda con algo más?`
    ]
  },
  citas: {
    keywords: ['citas', 'reuniones', 'agendar visita', 'calendario', 'visitar'],
    responses: [
      `Puedes gestionar todas tus citas (agendadas, pendientes y completadas) en la sección de Citas.

➡️ **Administra tus citas aquí:** /citas`
    ]
  },
  contratos: {
    keywords: ['contrato', 'contratos', 'firmar', 'documentos', 'servicios'],
    responses: [
      `Para generar o revisar contratos de servicios, puedes usar el formulario de contratos.

➡️ **Ir a Contratos:** /contratos`
    ]
  },
  comisiones_agente: {
    keywords: ['mis comisiones', 'cuánto gané', 'pagos', 'mi dinero'],
    responses: [
      `Puedes ver el dashboard de tus comisiones generadas como agente aquí:

➡️ **Ver mis Comisiones:** /comisiones`
    ]
  },
  dashboard_admin: {
    keywords: ['dashboard', 'estadísticas', 'admin', 'panel de control', 'inicio admin'],
    responses: [
      `Como administrador, tu panel principal con todas las estadísticas se encuentra aquí:

➡️ **Ir al Dashboard:** /dashboard/estadisticas`
    ]
  },
  admin_inmuebles: {
    keywords: ['gestionar inmuebles', 'aprobar inmueble', 'admin inmuebles', 'en venta', 'alquiler', 'anticrético'],
    responses: [
      `La gestión completa de TODOS los inmuebles del sistema (venta, alquiler, anticrético) se hace desde el panel de administración.

• **Ver Inmuebles en Venta:** /dashboard/inmuebles/venta
• **Ver Inmuebles en Alquiler:** /dashboard/inmuebles/alquiler
• **Ver Inmuebles en Anticrético:** /dashboard/inmuebles/anticretico`
    ]
  },
  usuarios_admin: {
    keywords: ['usuarios', 'gestionar usuarios', 'crear usuario admin', 'lista de usuarios'],
    responses: [
      `La lista completa y gestión de todos los usuarios del sistema (clientes, agentes, admins) está aquí:

➡️ **Gestionar Usuarios:** /dashboard/usuarios`
    ]
  },
  bitacora: {
    keywords: ['bitácora', 'log', 'logs', 'historial de acciones', 'quién hizo qué'],
    responses: [
      `El registro de auditoría (bitacora) que guarda todas las acciones importantes en el sistema se encuentra aquí:

➡️ **Ver Bitácora:** /dashboard/bitacora`
    ]
  },

  // --- NUEVAS CATEGORÍAS (basadas en Navbar y Sidebar) ---

  login: {
    keywords: ['login', 'iniciar sesion', 'entrar', 'acceder', 'registrarme', 'crear cuenta', 'contraseña', 'olvidé'],
    responses: [
      `Puedes iniciar sesión o registrarte desde la página de "Iniciar Sesión".

Si eres un nuevo cliente o agente, allí podrás crear tu cuenta. Si olvidaste tu contraseña, también encontrarás un enlace para recuperarla.

➡️ **Accede aquí:** /login`
    ]
  },
  desempeno: {
    keywords: ['desempeño', 'rendimiento', 'estadísticas agente', 'mis métricas', 'trendingup'],
    responses: [
      `Puedes ver tu desempeño como agente (propiedades vistas, contactos recibidos, etc.) en tu panel personal.

➡️ **Ver mi Desempeño:** /home/desempeno`
    ]
  },
  agentes: {
    keywords: ['agentes', 'lista de agentes', 'contactar un agente', 'hablar con agente', 'agentes-contacto'],
    responses: [
      `Puedes ver la lista de todos nuestros agentes y contactarlos directamente desde esta página.

➡️ **Ver Agentes:** /home/agentes-contacto`
    ]
  },
  perfil: {
    keywords: ['perfil', 'mi perfil', 'editar perfil', 'cambiar foto', 'mis datos', 'avatar'],
    responses: [
      `Puedes editar la información de tu perfil (nombre, foto, etc.) en la sección "Editar Perfil".

• **Si eres Cliente/Agente:** La encontrarás en tu menú de usuario, en la ruta /home/editar-perfil
• **Si eres Administrador:** Está en tu dashboard, en /dashboard/editar-perfil`
    ]
  },
  admin_tipos_inmueble: {
    keywords: ['tipos de inmueble', 'gestionar propiedad', 'categorías', 'tipo de casa', 'crear tipo', 'inmuebles/tipos'],
    responses: [
      `La gestión de los tipos de propiedad (Ej: "Casa", "Departamento", "Lote") se administra desde el dashboard.

➡️ **Gestionar Tipos:** /dashboard/inmuebles/tipos`
    ]
  },
  admin_anuncios: {
    keywords: ['anuncios', 'banners', 'publicidad', 'gestionar anuncios', 'anunciosadmin'],
    responses: [
      `Puedes crear, editar y gestionar los anuncios y banners que aparecen en la página pública desde el dashboard.

➡️ **Gestionar Anuncios:** /dashboard/anuncios`
    ]
  },
  admin_contratos: {
    keywords: ['admin contratos', 'gestionar contratos', 'ver todos los contratos', '/dashboard/contratos'],
    responses: [
      `Como administrador, puedes ver y gestionar TODOS los contratos de servicios generados en el sistema.

➡️ **Ver Contratos (Admin):** /dashboard/contratos`
    ]
  },
  admin_comisiones: {
    keywords: ['admin comisiones', 'gestionar comisiones', 'dashboard comisiones', 'pagos a agentes', '/dashboard/comisiones'],
    responses: [
      `El dashboard general para ver, aprobar y gestionar todas las comisiones de los agentes se encuentra aquí.

➡️ **Ver Comisiones (Admin):** /dashboard/comisiones`
    ]
  },
  admin_chat: {
    keywords: ['admin chat', 'ver todos los chats', 'chat dashboard', '/dashboard/chat'],
    responses: [
      `Como administrador, puedes monitorear o gestionar las conversaciones desde el panel de Chat del dashboard.

➡️ **Ir al Chat (Admin):** /dashboard/chat`
    ]
  },
  // Pega esto DENTRO de tu KNOWLEDGE_BASE, al final

    ayuda_cliente: {
      keywords: ['ayuda cliente', 'soy cliente', 'opciones de cliente', 'que puedo hacer como cliente'],
      responses: [
        `¡Hola! Como **Cliente**, puedes realizar estas acciones principales:

• **Buscar Propiedades:** Navega por todo el catálogo en /home/propiedades
• **Ver Detalles:** Haz clic en cualquier propiedad para ver fotos, precio y ubicación.
• **Contactar Agentes:** Encuentra y contacta a nuestros agentes en /home/agentes-contacto
• **Registrarte:** Crea tu cuenta o inicia sesión en /login
• **Chatear:** Habla directamente con agentes sobre propiedades que te interesan en /home/chat`
      ]
    },
    ayuda_agente: {
      keywords: ['ayuda agente', 'soy agente', 'opciones de agente', 'que puedo hacer como agente'],
      responses: [
        `¡Hola! Como **Agente**, estas son tus herramientas principales:

• **Publicar:** Crea y publica tus inmuebles en /mis-inmuebles/crear
• **Gestionar:** Ve tus publicaciones activas en /mis-inmuebles/aprobados
• **Historial:** Revisa tus publicaciones pasadas en /mis-inmuebles/historial
• **Citas:** Administra tu agenda de visitas en /home/citas
• **Comisiones:** Revisa tus comisiones ganadas en /home/comisiones
• **Desempeño:** Analiza tus métricas en /home/desempeno
• **Perfil:** Edita tu perfil público en /home/editar-perfil`
      ]
    },
    ayuda_admin: {
      keywords: ['ayuda admin', 'soy admin', 'opciones de admin', 'gestionar sistema', 'permisos'],
      responses: [
        `Como **Administrador**, tienes control total del sistema. Tus acciones clave son:

• **Dashboard:** Ver estadísticas generales en /dashboard/estadisticas
• **Permisos:** Gestionar roles y privilegios en /dashboard/permisos/grupos
• **Usuarios:** Administrar todos los usuarios en /dashboard/usuarios
• **Inmuebles:** Aprobar y gestionar todas las propiedades en /dashboard/inmuebles/venta
• **Solicitudes:** Aprobar nuevos agentes e inmuebles en /dashboard/solicitud-agente
• **Bitácora:** Revisar el historial de acciones en /dashboard/bitacora
• **Anuncios:** Gestionar los banners de la web en /dashboard/anuncios
• **Comisiones:** Ver el dashboard general de comisiones en /dashboard/comisiones`
      ]
    }
};

// --- Respuestas Conversacionales (sin emojis) ---
const CONVERSATIONAL_RESPONSES = {
  saludo: [
    '¡Hola! Soy tu asistente virtual de la inmobiliaria. ¿Cómo puedo ayudarte a encontrar tu nuevo hogar o a gestionar tus propiedades?',
    '¡Buenos días! Estoy aquí para ayudarte con cualquier duda sobre propiedades, citas o gestión del sistema.'
  ],
  despedida: [
    '¡Hasta luego! Que tengas un gran día.',
    'Ha sido un placer ayudarte. ¡Vuelve pronto!'
  ],
  agradecimiento: [
    '¡De nada! Es un placer ayudarte. ¿Hay algo más en lo que pueda asistirte?',
    '¡Me alegra poder ayudarte! ¿Necesitas algo más?',
    '¡No hay de qué! Estoy aquí para lo que necesites.'
  ],
  confusion: [
    `No estoy seguro de entender tu pregunta. Puedo ayudarte con:

• **Propiedades:** (Buscar, comprar, ver)
• **Agentes:** (Publicar, ver comisiones, gestionar citas)
• **Admin:** (Permisos, usuarios, bitácora)

¿Sobre cuál de estos temas te gustaría saber más?`
  ]
};

// --- El Hook (en JavaScript) ---
export const useChatBot = () => {
  const [state, setState] = useState({
    messages: [
      {
        id: '1',
        text: CONVERSATIONAL_RESPONSES.saludo[0],
        sender: 'bot',
        timestamp: new Date()
      }
    ],
    isTyping: false,
    isOpen: false,
    isMinimized: false
  });

  const findBestResponse = useCallback((message) => {
    const lowerMessage = message.toLowerCase();
    
    // Detectar saludos
    if (['hola', 'buenos días', 'buenas tardes'].some(greeting => lowerMessage.includes(greeting))) {
      return CONVERSATIONAL_RESPONSES.saludo[Math.floor(Math.random() * CONVERSATIONAL_RESPONSES.saludo.length)];
    }
    
    // Detectar despedidas
    if (['adiós', 'hasta luego', 'chao'].some(farewell => lowerMessage.includes(farewell))) {
      return CONVERSATIONAL_RESPONSES.despedida[Math.floor(Math.random() * CONVERSATIONAL_RESPONSES.despedida.length)];
    }
    
    // Detectar agradecimientos
    if (['gracias', 'te agradezco'].some(thanks => lowerMessage.includes(thanks))) {
      return CONVERSATIONAL_RESPONSES.agradecimiento[Math.floor(Math.random() * CONVERSATIONAL_RESPONSES.agradecimiento.length)];
    }

    // Buscar en la base de conocimiento
    for (const [, data] of Object.entries(KNOWLEDGE_BASE)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return data.responses[Math.floor(Math.random() * data.responses.length)];
      }
    }

    // Si no encuentra coincidencia
    return CONVERSATIONAL_RESPONSES.confusion[Math.floor(Math.random() * CONVERSATIONAL_RESPONSES.confusion.length)];
  }, []);

  const addMessage = useCallback((message) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  }, []);

  const simulateTyping = useCallback(async (response) => {
    setState(prev => ({ ...prev, isTyping: true }));
    
    const typingTime = Math.min(2500, Math.max(1000, response.length * 15));
    await new Promise(resolve => setTimeout(resolve, typingTime));
    
    setState(prev => ({ ...prev, isTyping: false }));
    
    addMessage({
      text: response,
      sender: 'bot'
    });
  }, [addMessage]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    addMessage({
      text: text.trim(),
      sender: 'user'
    });

    const response = findBestResponse(text);
    await simulateTyping(response);
  }, [addMessage, findBestResponse, simulateTyping]);

  const toggleOpen = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const toggleMinimized = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...state,
    sendMessage,
    toggleOpen,
    toggleMinimized,
    close
  };
};