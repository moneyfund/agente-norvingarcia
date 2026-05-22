import { useEffect, useState } from 'react';
import { getAvaluosByUser, subscribeAvaluos } from '../../../services/avaluos.service';
export const useAvaluosHistory = (uid?: string) => { const [items,setItems]=useState<any[]>([]);
  const refresh = async () => {
    if(!uid) return;
    const history = await getAvaluosByUser(uid);
    setItems(history);
  };
  useEffect(()=>{ refresh(); },[uid]);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }
    const unsub = subscribeAvaluos(setItems, console.error, uid);
    return () => unsub();
  }, [uid]);

  return { items, refresh };
};
