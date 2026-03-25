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
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';

const propiedadesCollection = 'propiedades';

const normalizeProperty = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
});

export async function getPropiedades() {
  assertFirebaseEnabled();
  const q = query(collection(db, propiedadesCollection), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(normalizeProperty);
}

export async function getPropiedadById(id) {
  assertFirebaseEnabled();
  const snap = await getDoc(doc(db, propiedadesCollection, id));
  if (!snap.exists()) return null;
  return normalizeProperty(snap);
}

export async function uploadPropertyImages(files = []) {
  assertFirebaseEnabled();
  if (!files.length) return [];

  const uploads = files.map(async (file) => {
    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const fileRef = ref(storage, `propiedades/${safeName}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  });

  return Promise.all(uploads);
}

export async function createPropiedad(payload) {
  assertFirebaseEnabled();
  const data = {
    ...payload,
    createdAt: serverTimestamp(),
  };

  const result = await addDoc(collection(db, propiedadesCollection), data);
  return result.id;
}

export async function updatePropiedad(id, payload) {
  assertFirebaseEnabled();
  await updateDoc(doc(db, propiedadesCollection, id), payload);
}

export async function deletePropiedad(id) {
  assertFirebaseEnabled();
  await deleteDoc(doc(db, propiedadesCollection, id));
}
