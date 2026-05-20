import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const avaluosCollection = collection(db, 'avaluos');

export const createAvaluo = async (payload) => {
  const docRef = await addDoc(avaluosCollection, {
    ...payload,
    fecha: serverTimestamp(),
  });
  return docRef.id;
};

export const getAvaluosByUser = async (usuarioId, search = '') => {
  const q = query(avaluosCollection, where('usuarioId', '==', usuarioId), orderBy('fecha', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((item) => {
      if (!search) return true;
      const needle = search.toLowerCase();
      return [item.tipoPropiedad, item.ciudad, item.municipio, item.zona].some((v) => String(v || '').toLowerCase().includes(needle));
    });
};
