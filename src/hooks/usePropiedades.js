import { useEffect, useState } from 'react';
import { getPropiedades } from '../services/propiedadesService';

export function usePropiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getPropiedades();
        setPropiedades(data);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las propiedades.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { propiedades, loading, error };
}
