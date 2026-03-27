import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { normalizePropertyMedia } from '../utils/propertyMedia';
import { assertAllowedAdmin } from './adminAuth';

const propiedadesCollection = 'propiedades';

const normalizeProperty = (snapshot) => {
  const data = snapshot.data();
  const media = normalizePropertyMedia(data);

  return {
    id: snapshot.id,
    ...data,
    tipoOperacion: data.tipoOperacion || 'venta',
    media,
    imagenes: media.filter((item) => item.type === 'image').map((item) => item.url),
    lat: Number(data.lat ?? 0),
    lng: Number(data.lng ?? 0),
  };
};

export function generatePropiedadId() {
  return doc(collection(db, propiedadesCollection)).id;
}

export async function getPropiedades() {
  const q = query(collection(db, propiedadesCollection), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(normalizeProperty);
}

export async function getPropiedadById(id) {
  const snap = await getDoc(doc(db, propiedadesCollection, id));
  if (!snap.exists()) return null;
  return normalizeProperty(snap);
}

export async function createPropiedad(payload) {
  assertAllowedAdmin();

  const data = {
    ...payload,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  if (payload?.id) {
    const propertyRef = doc(db, propiedadesCollection, payload.id);
    await setDoc(propertyRef, data);
    return payload.id;
  }

  const result = await addDoc(collection(db, propiedadesCollection), data);
  return result.id;
}

export async function updatePropiedad(id, payload) {
  assertAllowedAdmin();
  const { id: _ignoredId, ...rest } = payload || {};
  await updateDoc(doc(db, propiedadesCollection, id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePropiedad(id) {
  assertAllowedAdmin();
  await deleteDoc(doc(db, propiedadesCollection, id));
}
