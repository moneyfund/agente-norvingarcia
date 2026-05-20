import { useCallback, useState } from 'react';
import { createAvaluo, getAvaluosByUser } from '../services/avaluos.service';

export const useAvaluos = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const loadByUser = useCallback(async (uid, search) => {
    if (!uid) return;
    setLoading(true);
    try {
      const data = await getAvaluosByUser(uid, search);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (payload) => {
    setLoading(true);
    try {
      return await createAvaluo(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, items, loadByUser, save };
};
