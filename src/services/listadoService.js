import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { assertAllowedAdmin } from './adminAuth';
import { db, storage } from '../firebase/config';

const COLLECTION = 'captaciones';


export async function getListadoPropiedades({ zona, tipoPropiedad } = {}) {
  const items = await getCaptacionesAdmin();
  return items.filter((item) => item.source === 'listado-interno'
    && (!zona || item.zona === zona)
    && (!tipoPropiedad || item.tipoPropiedad === tipoPropiedad)).slice(0, 50);
}

export async function createListadoPropiedad(payload, userId) {
  assertAllowedAdmin();
  const codigoInterno = `CAP-${Date.now().toString().slice(-6)}`;
  const result = await addDoc(collection(db, COLLECTION), {
    ...payload,
    source: 'listado-interno',
    codigoInterno,
    createdBy: userId,
    createdAt: serverTimestamp(),
    estado: 'borrador',
    publicada: false,
    publishedAt: null,
    updatedAt: serverTimestamp(),
  });

  return { id: result.id, codigoInterno };
}

export async function updateListadoPropiedad(id, payload) {
  assertAllowedAdmin();
  const { id: _id, createdAt: _created, createdBy: _author, imagenes, ...fields } = payload;
  await updateDoc(doc(db, COLLECTION, id), {
    ...fields,
    ...(imagenes?.length ? { imagenes: arrayUnion(...imagenes) } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function getCaptacionesAdmin() {
  assertAllowedAdmin();
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function uploadListadoImages(files, propertyId) {
  assertAllowedAdmin();
  const uploads = files.map(async (file) => {
    const fileRef = ref(storage, `listado/${propertyId}/${file.lastModified}-${file.size}-${file.name.replace(/[^a-z0-9.-]+/gi, '-')}`);
    await uploadBytes(fileRef, file, { cacheControl: 'private, no-store' });
    return fileRef.fullPath;
  });

  return Promise.all(uploads);
}
