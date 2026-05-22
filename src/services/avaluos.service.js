import { addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const avaluosCollection = collection(db, 'avaluos');

export const createAvaluo = async (payload) => {
  const authUser = auth.currentUser;
  if (!authUser?.uid) {
    throw new Error('Debes iniciar sesión para guardar un avalúo.');
  }

  if (payload?.usuarioId !== authUser.uid) {
    throw new Error('No tienes permisos para guardar avalúos de otro usuario.');
  }

  const docRef = await addDoc(avaluosCollection, {
    id: crypto.randomUUID(),
    ...payload,
    usuarioId: authUser.uid,
    createdAtServer: serverTimestamp(),
  });
  return docRef.id;
};

export const getAvaluosByUser = async (usuarioId) => {
  const q = query(avaluosCollection, where('usuarioId', '==', usuarioId), orderBy('createdAtServer', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getAllAvaluos = async () => {
  const q = query(avaluosCollection, orderBy('createdAtServer', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const subscribeAvaluos = (onData, onError, usuarioId) => {
  const q = usuarioId
    ? query(avaluosCollection, where('usuarioId', '==', usuarioId), orderBy('createdAtServer', 'desc'))
    : query(avaluosCollection, orderBy('createdAtServer', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
    onError,
  );
};
