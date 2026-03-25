import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validateContent, validatePropertyId, validateRating } from './firestoreValidation';

function resenasCollectionRef(propertyId) {
  return collection(db, 'propiedades', propertyId, 'resenas');
}

export function getReviewsByProperty(propertyId, onData, onError) {
  const safePropertyId = validatePropertyId(propertyId);
  const q = query(resenasCollectionRef(safePropertyId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const resenas = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      onData(resenas);
    },
    (error) => {
      console.error('Firestore getReviewsByProperty error:', { propertyId: safePropertyId, error });
      onError?.(buildError(error, 'No se pudieron cargar las reseñas.'));
    },
  );
}

export async function createReview(propertyId, user, rating, content) {
  const safePropertyId = validatePropertyId(propertyId);
  const safeUser = validateAuthUser(user);
  const safeRating = validateRating(rating);
  const safeContent = validateContent(content, 'reseña');

  console.log('createReview propertyId:', safePropertyId);
  console.log('auth user:', safeUser.uid);

  try {
    await addDoc(resenasCollectionRef(safePropertyId), {
      uid: safeUser.uid,
      userName: safeUser.userName,
      userEmail: safeUser.userEmail,
      userPhotoURL: safeUser.userPhotoURL,
      rating: safeRating,
      content: safeContent,
      propertyId: safePropertyId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Firestore createReview error:', { propertyId: safePropertyId, uid: safeUser.uid, error });
    throw buildError(error, 'No se pudo guardar la reseña.');
  }
}
