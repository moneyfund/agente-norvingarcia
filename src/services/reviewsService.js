import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';

function reviewDocId(propertyId, uid) {
  return `${propertyId}_${uid}`;
}

export function subscribeToReviews(propertyId, callback) {
  const q = query(
    collection(db, 'reviews'),
    where('propertyId', '==', propertyId),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export async function upsertReview({ propertyId, rating, message, user }) {
  const ref = doc(db, 'reviews', reviewDocId(propertyId, user.uid));
  await setDoc(
    ref,
    {
      propertyId,
      uid: user.uid,
      displayName: user.displayName || user.email || 'Usuario',
      photoURL: user.photoURL || '',
      rating,
      message,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
