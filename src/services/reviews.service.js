import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validateContent, validatePropertyId, validateRating } from './firestoreValidation';

function resenasCollectionRef(propertyId) {
  return collection(db, 'propiedades', propertyId, 'resenas');
}

export function subscribeToReviews(propertyId, callback) {
  const safePropertyId = validatePropertyId(propertyId);
  if (typeof callback !== 'function') {
    throw new Error('Debes proporcionar un callback para escuchar reseñas.');
  }

  const q = query(resenasCollectionRef(safePropertyId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const resenas = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      callback(resenas);
    },
    (error) => {
      console.error('Firestore subscribeToReviews error:', { propertyId: safePropertyId, error });
    },
  );
}

export async function createReview(propertyId, user, rating, content) {
  const safePropertyId = validatePropertyId(propertyId);
  const safeUser = validateAuthUser(user);
  const safeRating = validateRating(rating);
  const safeContent = validateContent(content, 'reseña');

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
