import { useEffect, useState } from 'react';
import { getAvaluosByUser } from '../../../services/avaluos.service';
import type { AvaluoRecord } from '../types/avaluo.types';

export const useAvaluosHistory = (usuarioId?: string) => {
  const [items, setItems] = useState<AvaluoRecord[]>([]);

  useEffect(() => {
    if (!usuarioId) return;
    getAvaluosByUser(usuarioId).then((rows) => setItems(rows as AvaluoRecord[]));
  }, [usuarioId]);

  return { items, setItems };
};
