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
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const propiedadesCollection = 'propiedades';

const normalizeImages = (data = {}) => {
  if (Array.isArray(data.imagenes) && data.imagenes.length) return data.imagenes;
  if (typeof data.imagen === 'string' && data.imagen.trim()) return [data.imagen.trim()];
  return [];
};

const normalizeProperty = (snapshot) => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    tipoOperacion: data.tipoOperacion || 'venta',
    imagenes: normalizeImages(data),
    lat: Number(data.lat ?? 0),
    lng: Number(data.lng ?? 0),
  };
};

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
  const data = {
    ...payload,
    createdAt: serverTimestamp(),
  };

  const result = await addDoc(collection(db, propiedadesCollection), data);
  return result.id;
}

export async function updatePropiedad(id, payload) {
  await updateDoc(doc(db, propiedadesCollection, id), payload);
}

export async function deletePropiedad(id) {
  await deleteDoc(doc(db, propiedadesCollection, id));
}
