import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validateCommentPayload, validatePropertyId } from './firestoreValidation';

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
      console.error('Error al leer comentarios', { propertyId: safePropertyId, error });
      onError?.(buildError(error, 'No se pudieron cargar los comentarios.'));
    },
  );
}

export async function createComment(propertyId, payload, user) {
  const safePropertyId = validatePropertyId(propertyId);
  const safePayload = validateCommentPayload(payload);
  const safeUser = validateAuthUser(user);

  try {
    await addDoc(comentariosCollectionRef(safePropertyId), {
      ...safeUser,
      propertyId: safePropertyId,
      message: safePayload.message,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'publicado',
    });
  } catch (error) {
    console.error('Error al crear comentario', { propertyId: safePropertyId, uid: safeUser.uid, error });
    throw buildError(error, 'No se pudo guardar el comentario.');
  }
}
