import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validateContent, validatePropertyId } from './firestoreValidation';

function comentariosCollectionRef(propertyId) {
  return collection(db, 'propiedades', propertyId, 'comentarios');
}

export function getCommentsByProperty(propertyId, onData, onError) {
  const safePropertyId = validatePropertyId(propertyId);
  const q = query(comentariosCollectionRef(safePropertyId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const comentarios = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      onData(comentarios);
    },
    (error) => {
      console.error('Firestore getCommentsByProperty error:', { propertyId: safePropertyId, error });
      onError?.(buildError(error, 'No se pudieron cargar los comentarios.'));
    },
  );
}

export async function createComment(propertyId, user, content) {
  const safePropertyId = validatePropertyId(propertyId);
  const safeUser = validateAuthUser(user);
  const safeContent = validateContent(content, 'comentario');

  console.log('createComment propertyId:', safePropertyId);
  console.log('auth user:', safeUser.uid);

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
