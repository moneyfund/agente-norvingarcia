import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validateContent, validatePropertyId } from './firestoreValidation';

function comentariosCollectionRef(propertyId) {
  return collection(db, 'propiedades', propertyId, 'comentarios');
}

export function subscribeToComments(propertyId, callback) {
  const safePropertyId = validatePropertyId(propertyId);
  if (typeof callback !== 'function') {
    throw new Error('Debes proporcionar un callback para escuchar comentarios.');
  }

  const q = query(comentariosCollectionRef(safePropertyId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const comentarios = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      callback(comentarios);
    },
    (error) => {
      console.error('Firestore subscribeToComments error:', { propertyId: safePropertyId, error });
    },
  );
}

export async function createComment(propertyId, user, content) {
  const safePropertyId = validatePropertyId(propertyId);
  const safeUser = validateAuthUser(user);
  const safeContent = validateContent(content, 'comentario');

  try {
    await addDoc(comentariosCollectionRef(safePropertyId), {
      uid: safeUser.uid,
      userName: safeUser.userName,
      userEmail: safeUser.userEmail,
      userPhotoURL: safeUser.userPhotoURL,
      content: safeContent,
      propertyId: safePropertyId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Firestore createComment error:', { propertyId: safePropertyId, uid: safeUser.uid, error });
    throw buildError(error, 'No se pudo guardar el comentario.');
  }
}
