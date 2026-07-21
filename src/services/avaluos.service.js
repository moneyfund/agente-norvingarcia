import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const avaluosCollection = collection(db, 'avaluos');

const normalizeFirestoreData = (value) => {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(normalizeFirestoreData);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeFirestoreData(item)]),
    );
  }
  return value;
};

export const createAvaluo = async (payload) => {
  const authUser = auth.currentUser;
  if (!authUser?.uid) {
    throw new Error('Debes iniciar sesión para guardar un avalúo.');
  }

  if (payload?.usuarioId !== authUser.uid) {
    throw new Error('No tienes permisos para guardar avalúos de otro usuario.');
  }

  const datosGuardar = normalizeFirestoreData({
    ...payload,
    usuarioId: authUser.uid,
    createdAt: serverTimestamp(),
    createdAtServer: serverTimestamp(),
  });
  console.log(datosGuardar);

  const docRef = await addDoc(avaluosCollection, datosGuardar);
  return docRef.id;
};

export const updateAvaluo = async (id, payload) => {
  if (!id) throw new Error('ID de avalúo inválido para actualización.');
  const docRef = doc(db, 'avaluos', id);
  await updateDoc(docRef, normalizeFirestoreData(payload));
};

export const getAvaluosByUser = async (usuarioId) => {
  const q = query(avaluosCollection, where('usuarioId', '==', usuarioId), orderBy('createdAtServer', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const getAllAvaluos = async () => {
  const q = query(avaluosCollection, orderBy('createdAtServer', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const getAvaluoById = async (id) => {
  if (!id || typeof id !== 'string') {
    throw new Error('ID de avalúo inválido para consulta en Firestore.');
  }

  const docRef = doc(db, 'avaluos', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id };
};

export const subscribeAvaluos = (onData, onError, usuarioId) => {
  const q = usuarioId
    ? query(avaluosCollection, where('usuarioId', '==', usuarioId), orderBy('createdAtServer', 'desc'))
    : query(avaluosCollection, orderBy('createdAtServer', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))),
    onError,
  );
};
