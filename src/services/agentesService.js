import { collection, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/config';

const agentesCollection = 'agentes';
const defaultAgentId = 'norvin-garcia';

export async function getAgente(agentId = defaultAgentId) {
  const snap = await getDoc(doc(db, agentesCollection, agentId));
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  const q = query(collection(db, agentesCollection));
  const all = await getDocs(q);
  if (!all.empty) {
    const first = all.docs[0];
    return { id: first.id, ...first.data() };
  }

  return null;
}

export async function uploadAgentPhoto(file) {
  if (!file) return '';
  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const fileRef = ref(storage, `agentes/${safeName}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function saveAgente(data, agentId = defaultAgentId) {
  await setDoc(doc(db, agentesCollection, agentId), data, { merge: true });
  return agentId;
}
