import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, runTransaction, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { assertAllowedAdmin } from './adminAuth';
import { auth, db } from '../firebase/config';

const avaluosCollection = collection(db, 'avaluos');

const normalizeFirestoreData = (value) => {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(normalizeFirestoreData);
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeFirestoreData(item)]),
    );
  }
  return value;
};

export const newAvaluoId = () => doc(avaluosCollection).id;

export const createAvaluo = async (payload, id) => {
  assertAllowedAdmin();
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

  if (id) {
    const report = doc(avaluosCollection, id);
    await runTransaction(db, async (transaction) => {
      if (!(await transaction.get(report)).exists()) transaction.set(report, datosGuardar);
    });
    return id;
  }
  const docRef = await addDoc(avaluosCollection, datosGuardar);
  return docRef.id;
};

export const updateAvaluo = async (id, payload) => {
  assertAllowedAdmin();
  if (!id) throw new Error('ID de avalúo inválido para actualización.');
  const docRef = doc(db, 'avaluos', id);
  await updateDoc(docRef, normalizeFirestoreData(payload));
};

function sortedHistory(snapshot) {
  function dateValue(item) {
    const timestamp = item.createdAtServer?.toMillis?.() ?? item.createdAt?.toMillis?.();
    if (timestamp != null) return timestamp;
    return Date.parse(item.createdAt) || 0;
  }
  return snapshot.docs.map((record) => ({ ...record.data(), id: record.id }))
    .sort((a, b) => dateValue(b) - dateValue(a));
}

export const getAvaluosByUser = async (usuarioId) => {
  assertAllowedAdmin();
  return sortedHistory(await getDocs(query(avaluosCollection, where('usuarioId', '==', usuarioId))));
};

export const getAllAvaluos = async () => {
  assertAllowedAdmin();
  return sortedHistory(await getDocs(avaluosCollection));
};

export const getAvaluoById = async (id) => {
  assertAllowedAdmin();
  if (!id || typeof id !== 'string') {
    throw new Error('ID de avalúo inválido para consulta en Firestore.');
  }

  const docRef = doc(db, 'avaluos', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id };
};

export const subscribeAvaluos = (onData, onError, usuarioId) => {
  assertAllowedAdmin();
  const records = usuarioId ? query(avaluosCollection, where('usuarioId', '==', usuarioId)) : avaluosCollection;
  return onSnapshot(records, (snapshot) => onData(sortedHistory(snapshot)), onError);
};
