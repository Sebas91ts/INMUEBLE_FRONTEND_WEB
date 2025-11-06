import { useEffect, useState } from "react";
import axios from "../api/axios";

/** Cuenta alertas próximas no enviadas para badge. */
export default function useAlertBadge(token, role = "cliente") {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!token) return;
        let alive = true;

        const fetchCount = async () => {
            try {
                // CORRECCIÓN CLAVE: La ruta para 'cliente' debe ser la definida en tu urls.py
                const url = 
                    role === "admin" 
                        ? "/alertas?filtro=proximos" 
                        : "/alertas/mis_alertas/?filtro=proximos"; // <-- RUTA CORREGIDA

                const { data } = await axios.get(url, {
                    headers: { Authorization: `Token ${token}` },
                });
                
                const list = data?.values || [];
                
                // Filtra para contar solo las que no están en estado 'enviado'
                const pending = list.filter((a) => a.estado !== "enviado").length;
                
                if (alive) setCount(pending);

            } catch (error) {
                // Opcional: Loguear errores de red, pero mantener la cuenta en 0 para no interrumpir la app
                console.error("Error fetching alert badge count:", error);
            }
        };

        // Ejecuta inmediatamente
        fetchCount();
        
        // Ejecuta cada 60 segundos (60000ms)
        const id = setInterval(fetchCount, 60000);
        
        // Función de limpieza de React
        return () => { alive = false; clearInterval(id); };
    }, [token, role]);

    return count;
}