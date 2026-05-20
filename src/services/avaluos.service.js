import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const avaluosCollection = collection(db, 'avaluos');

export const createAvaluo = async (payload) => {
  const docRef = await addDoc(avaluosCollection, {
    ...payload,
    createdAtServer: serverTimestamp(),
  });
  return docRef.id;
};

export const getAvaluosByUser = async (usuarioId) => {
  const q = query(avaluosCollection, where('usuarioId', '==', usuarioId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
