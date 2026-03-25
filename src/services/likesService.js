import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';

function likeDocId(propertyId, uid) {
  return `${propertyId}_${uid}`;
}

export async function togglePropertyLike({ propertyId, uid, hasLiked }) {
  const ref = doc(db, 'likes', likeDocId(propertyId, uid));
  if (hasLiked) {
    await deleteDoc(ref);
    return;
  }

  await setDoc(ref, {
    propertyId,
    uid,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToLikes(propertyId, callback) {
  const q = query(collection(db, 'likes'), where('propertyId', '==', propertyId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}
