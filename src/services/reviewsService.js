import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validatePropertyId, validateReviewPayload } from './firestoreValidation';

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
      console.error('Error al leer reseñas', { propertyId: safePropertyId, error });
      onError?.(buildError(error, 'No se pudieron cargar las reseñas.'));
    },
  );
}

export async function createReview(propertyId, payload, user) {
  const safePropertyId = validatePropertyId(propertyId);
  const safePayload = validateReviewPayload(payload);
  const safeUser = validateAuthUser(user);

  try {
    await addDoc(resenasCollectionRef(safePropertyId), {
      ...safeUser,
      propertyId: safePropertyId,
      rating: safePayload.rating,
      message: safePayload.message,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'publicado',
    });
  } catch (error) {
    console.error('Error al crear reseña', { propertyId: safePropertyId, uid: safeUser.uid, error });
    throw buildError(error, 'No se pudo guardar la reseña.');
  }
}
