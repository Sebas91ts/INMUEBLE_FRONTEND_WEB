import { useEffect, useState } from 'react'
import { getPrivilegios } from '../api/auth/privilegios' // ajusta la ruta


export const usePrivilegios = () => {
  const [privilegios, setPrivilegios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrivilegios = async () => {
      try {
        const { data } = await getPrivilegios();

        if (data.status === 1 && Array.isArray(data.values)) {
          // Filtrar privilegios donde todos los permisos sean falsos
          const filtrados = data.values.filter(
            (p) =>
              p.puede_crear ||
              p.puede_actualizar ||
              p.puede_eliminar ||
              p.puede_leer ||
              p.puede_activar
          );
          setPrivilegios(filtrados);
        } else {
          setPrivilegios([]);
        }
      } catch (err) {
        console.error("Error obteniendo privilegios:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivilegios();
  }, []);

  return { privilegios, loading, error };
};
