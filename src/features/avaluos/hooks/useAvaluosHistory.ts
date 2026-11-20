import { useEffect, useState } from 'react';
import { subscribeAvaluos } from '../../../services/avaluos.service';

export function useAvaluosHistory(uid?: string) {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    setItems([]);
    setError('');
    if (!uid) return;
    return subscribeAvaluos(setItems, () => setError('No se pudo cargar el historial.'));
  }, [uid]);
  const removeLocal = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  return { items, error, removeLocal };
}
