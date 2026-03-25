import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export function subscribeToComments(propertyId, callback) {
  const q = query(
    collection(db, 'comments'),
    where('propertyId', '==', propertyId),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export async function createComment({ propertyId, message, user }) {
  await addDoc(collection(db, 'comments'), {
    propertyId,
    uid: user.uid,
    displayName: user.displayName || user.email || 'Usuario',
    photoURL: user.photoURL || '',
    message,
    createdAt: serverTimestamp(),
  });
}
