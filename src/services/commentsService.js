import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

function comentariosCollectionRef(propertyId) {
  return collection(db, 'propiedades', propertyId, 'comentarios');
}

export function subscribeToComments(propertyId, callback) {
  try {
    const q = query(comentariosCollectionRef(propertyId), orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const comentarios = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        callback(comentarios);
      },
      (error) => {
        console.error('Error al escuchar comentarios de la propiedad', { propertyId, error });
      },
    );
  } catch (error) {
    console.error('Error al crear listener de comentarios', { propertyId, error });
    return () => {};
  }
}

export async function createComment({ propertyId, message, user }) {
  try {
    await addDoc(comentariosCollectionRef(propertyId), {
      uid: user.uid,
      propertyId,
      displayName: user.displayName || user.email || 'Usuario',
      photoURL: user.photoURL || '',
      message,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al crear comentario', { propertyId, uid: user?.uid, error });
    throw error;
  }
}
