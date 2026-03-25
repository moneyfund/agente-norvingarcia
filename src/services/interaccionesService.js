import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export function subscribeToProperty(propertyId, callback) {
  return onSnapshot(doc(db, 'propiedades', propertyId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback({ id: snapshot.id, ...snapshot.data() });
  });
}

export async function togglePropertyLike(propertyId, userId, hasLiked) {
  const propertyRef = doc(db, 'propiedades', propertyId);
  await setDoc(propertyRef, { likes: [] }, { merge: true });
  await updateDoc(propertyRef, {
    likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export function subscribeToComments(propertyId, callback) {
  const commentsQuery = query(
    collection(db, 'comentarios'),
    where('propiedadId', '==', propertyId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(commentsQuery, (snapshot) => {
    const comments = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

    callback(comments);
  });
}

export async function addComment({ propiedadId, userId, nombre, comentario }) {
  await addDoc(collection(db, 'comentarios'), {
    propiedadId,
    userId,
    nombre,
    comentario,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToReviews(propertyId, callback) {
  const reviewsQuery = query(
    collection(db, 'resenas'),
    where('propiedadId', '==', propertyId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(reviewsQuery, (snapshot) => {
    const reviews = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

    callback(reviews);
  });
}

export async function addReview({ propiedadId, userId, nombre, comentario, rating }) {
  await addDoc(collection(db, 'resenas'), {
    propiedadId,
    userId,
    nombre,
    comentario,
    rating,
    createdAt: serverTimestamp(),
  });
}
