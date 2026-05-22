import { useEffect, useState } from 'react';
import { getAvaluosByUser } from '../../../services/avaluos.service';
export const useAvaluosHistory = (uid?: string) => { const [items,setItems]=useState<any[]>([]); useEffect(()=>{ if(!uid) return; getAvaluosByUser(uid).then(setItems); },[uid]); return { items }; };
