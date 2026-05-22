import { useEffect, useState } from 'react';
import { getAvaluosByUser } from '../../../services/avaluos.service';
export const useAvaluosHistory = (uid?: string) => { const [items,setItems]=useState<any[]>([]);
  const refresh = async () => {
    if(!uid) return;
    const history = await getAvaluosByUser(uid);
    setItems(history);
  };
  useEffect(()=>{ refresh(); },[uid]);
  return { items, refresh };
};
