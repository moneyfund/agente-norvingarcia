import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function createProtectedFormSubmission({ type, payload, user }) {
  await addDoc(collection(db, 'protectedForms'), {
    type,
    uid: user.uid,
    displayName: user.displayName || user.email || 'Usuario',
    email: user.email || payload.email || '',
    photoURL: user.photoURL || '',
    payload,
    createdAt: serverTimestamp(),
  });
}
