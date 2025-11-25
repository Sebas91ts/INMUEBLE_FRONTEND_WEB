import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import  ChatBot  from './components/ChatBot'
import AppRoutes from './routes/routes'
import './index.css'
import 'leaflet/dist/leaflet.css'




ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <ChatBot />
    </BrowserRouter>
  </React.StrictMode>
)
