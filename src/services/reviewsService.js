import { collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

function resenasCollectionRef(propertyId) {
  return collection(db, 'propiedades', propertyId, 'resenas');
}

export function subscribeToReviews(propertyId, callback) {
  try {
    const q = query(resenasCollectionRef(propertyId), orderBy('updatedAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const resenas = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        callback(resenas);
      },
      (error) => {
        console.error('Error al escuchar reseñas de la propiedad', { propertyId, error });
      },
    );
  } catch (error) {
    console.error('Error al crear listener de reseñas', { propertyId, error });
    return () => {};
  }
}

export async function upsertReview({ propertyId, rating, message, user }) {
  const reviewRef = doc(db, 'propiedades', propertyId, 'resenas', user.uid);

  try {
    const existingReview = await getDoc(reviewRef);

    await setDoc(
      reviewRef,
      {
        uid: user.uid,
        propertyId,
        displayName: user.displayName || user.email || 'Usuario',
        photoURL: user.photoURL || '',
        rating,
        message,
        createdAt: existingReview.exists() ? existingReview.data().createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error('Error al crear o actualizar reseña', { propertyId, uid: user?.uid, error });
    throw error;
  }
}
