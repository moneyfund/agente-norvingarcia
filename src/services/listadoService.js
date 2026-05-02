import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/config';

const COLLECTION = 'captaciones';
const PUBLIC_PROPERTIES_COLLECTION = 'properties';

const buildSearchConstraints = ({ zona, tipoPropiedad }) => {
  const constraints = [where('source', '==', 'listado-interno')];

  if (zona) constraints.push(where('zona', '==', zona));
  if (tipoPropiedad) constraints.push(where('tipoPropiedad', '==', tipoPropiedad));

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(50));

  return constraints;
};

export async function getListadoPropiedades(filters = {}) {
  const constraints = buildSearchConstraints(filters);
  const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createListadoPropiedad(payload, userId) {
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
  await updateDoc(doc(db, COLLECTION, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function getCaptacionesAdmin() {
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function uploadListadoImages(files, propertyId) {
  const uploads = files.map(async (file) => {
    const fileRef = ref(storage, `listado/${propertyId}/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  });

  return Promise.all(uploads);
}

export async function createPublicProperty(payload) {
  const ref = collection(db, PUBLIC_PROPERTIES_COLLECTION);
  const docRef = await addDoc(ref, {
    tipo: payload.tipo,
    precio: payload.precio,
    descripcion: payload.descripcion,
    telefono: payload.telefono,
    ubicacion: payload.ubicacion,
    status: 'pendiente',
    source: 'publicar-propiedad',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id };
}
