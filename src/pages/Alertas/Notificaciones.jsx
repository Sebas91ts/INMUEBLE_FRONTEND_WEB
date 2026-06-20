// src/pages/Alertas/Notificaciones.jsx

import React, { useState, useEffect, useCallback } from 'react'
import { getMisAlertas, marcarAlertaComoVista, descartarAlerta } from '../../api/alertas/alertas'
import { useAuth } from '../../hooks/useAuth'
import { Bell, Clock, CheckCircle, Trash2, Eye, FileText, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast' 

// Componente para renderizar cada tarjeta de alerta
const AlertCard = ({ alert, onUpdate }) => {
    const { user } = useAuth()
    const isUnseen = alert.estado_visto === 'no_visto'
    const isVisto = alert.estado_visto === 'visto'
    const isDiscarded = alert.estado_visto === 'descartado'

    // Lógica para determinar el ícono y color
    const isError = alert.estado_envio === 'fallido'
    const Icon = isError ? XCircle : (alert.tipo_alerta.includes('pago') || alert.tipo_alerta.includes('anticretico') ? FileText : Bell)
    
    const bgColor = isError ? 'bg-red-50 border-red-200' : isUnseen ? 'bg-blue-50 border-blue-200' : isDiscarded ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'
    const timeAgo = new Date(alert.fecha_programada).toLocaleDateString() + ' ' + new Date(alert.fecha_programada).toLocaleTimeString()

    const handleMarkAsSeen = async () => {
        if (isUnseen) {
            try {
                await marcarAlertaComoVista(alert.id)
                onUpdate()
                toast.success('Alerta marcada como vista')
            } catch (error) {
                toast.error('Error al marcar como visto.')
            }
        }
    }

    const handleDiscard = async () => {
        if (!isDiscarded) {
            try {
                await descartarAlerta(alert.id)
                onUpdate()
                toast.success('Alerta descartada')
            } catch (error) {
                toast.error('Error al descartar la alerta.')
            }
        }
    }

    return (
        <div className={`p-4 mb-3 rounded-lg border shadow-sm transition-all ${bgColor}`}>
            <div className='flex justify-between items-start'>
                {/* Contenido Principal */}
                <div className='flex items-center space-x-3 w-full' onClick={handleMarkAsSeen} role="button">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isUnseen ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div className='flex-1 min-w-0'>
                        <p className={`font-semibold ${isUnseen ? 'text-blue-800' : 'text-gray-900'} truncate`}>
                            {alert.tipo_alerta.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className={`text-sm ${isUnseen ? 'text-gray-700' : 'text-gray-600'}`}>{alert.mensaje}</p>
                        <span className='text-xs text-gray-400 mt-1 flex items-center'>
                            <Clock className='w-3 h-3 mr-1' /> {timeAgo}
                        </span>
                    </div>
                </div>

                {/* Acciones */}
                <div className='flex space-x-2 min-w-[100px] justify-end'>
                    {isUnseen && (
                        <button 
                            onClick={handleMarkAsSeen}
                            title='Marcar como visto'
                            className='p-1.5 rounded-full text-blue-600 hover:bg-blue-100 transition-colors'
                        >
                            <Eye className='w-4 h-4' />
                        </button>
                    )}
                    {(isUnseen || isVisto) && (
                        <button 
                            onClick={handleDiscard}
                            title='Descartar'
                            className='p-1.5 rounded-full text-red-500 hover:bg-red-100 transition-colors'
                        >
                            <Trash2 className='w-4 h-4' />
                        </button>
                    )}
                    {isDiscarded && (
                        <span className='text-xs text-gray-500 italic flex items-center'>Descartada</span>
                    )}
                </div>
            </div>
            
            {/* Opcional: Enlace al contrato si existe */}
            {alert.contrato && (
                <Link 
                    to={`/home/contratos-page/${alert.contrato}`}
                    className='mt-2 inline-flex items-center text-xs text-blue-500 hover:underline'
                >
                    Ver Contrato ID {alert.contrato}
                </Link>
            )}
        </div>
    )
}

// ----------------------------------------------------

export default function Notificaciones() {
    const { token } = useAuth()
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchAlerts = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getMisAlertas()
            const data = response.data.values.alertas
            
            // Ordenar: No Vistas primero, luego por fecha más reciente
            const sortedAlerts = data.sort((a, b) => {
                if (a.estado_visto === 'no_visto' && b.estado_visto !== 'no_visto') return -1;
                if (a.estado_visto !== 'no_visto' && b.estado_visto === 'no_visto') return 1;
                return new Date(b.fecha_programada) - new Date(a.fecha_programada); 
            });
            setAlerts(sortedAlerts)
        } catch (e) {
            toast.error('No se pudieron cargar las notificaciones.')
            setAlerts([])
        } finally {
            setLoading(false)
        }
    }, [token])

    useEffect(() => {
        fetchAlerts()
    }, [fetchAlerts])


    if (loading) {
        return <div className='container mx-auto p-6'>Cargando notificaciones...</div>
    }

    return (
        <div className='container mx-auto p-6'>
            <h2 className='text-3xl font-bold text-gray-800 mb-6 flex items-center'>
                <Bell className='w-7 h-7 mr-2' /> Mis Notificaciones
            </h2>
            
            {alerts.length === 0 ? (
                <div className='text-center py-10 bg-gray-50 rounded-lg border border-gray-200'>
                    <CheckCircle className='w-10 h-10 text-green-500 mx-auto mb-3' />
                    <p className='text-gray-600'>No tienes notificaciones pendientes.</p>
                </div>
            ) : (
                <div className='max-w-3xl'>
                    {alerts.map(alert => (
                        <AlertCard key={alert.id} alert={alert} onUpdate={fetchAlerts} />
                    ))}
                </div>
            )}
        </div>
    )
}