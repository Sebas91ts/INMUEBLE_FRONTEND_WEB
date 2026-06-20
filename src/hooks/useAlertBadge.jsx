// src/hooks/useAlertBadge.js

import { useState, useEffect, useCallback } from 'react'
import { getMisAlertas} from '../api/alertas/alertas' 

export default function useAlertBadge(token) {
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchAlerts = useCallback(async () => {
        if (!token) {
            setUnreadCount(0)
            return
        }

        try {
            
            const response = await getMisAlertas()
            const alerts = response.data.values.alertas 
            const count = alerts.filter(alert => alert.estado_visto === 'no_visto').length
            setUnreadCount(count)
        } catch (error) {
            console.error('Error al obtener el badge de alertas:', error)
            setUnreadCount(0)
        }
    }, [token])

    useEffect(() => {
        fetchAlerts()

        // Refrescar la cuenta periódicamente (ej. cada 60 segundos)
        const intervalId = setInterval(fetchAlerts, 60000) 
        
        return () => clearInterval(intervalId)
    }, [fetchAlerts])

    return unreadCount
}