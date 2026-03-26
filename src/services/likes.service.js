import { collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validatePropertyId, validateUid } from './firestoreValidation';

function likesCollectionRef(propertyId) {
  return collection(db, 'propiedades', propertyId, 'likes');
}

function likeRef(propertyId, uid) {
  return doc(db, 'propiedades', propertyId, 'likes', uid);
}

export function subscribeToLikesCount(propertyId, callback, onError) {
  const safePropertyId = validatePropertyId(propertyId);
  if (typeof callback !== 'function') {
    throw new Error('Debes proporcionar un callback para escuchar likes.');
  }

  return onSnapshot(
    likesCollectionRef(safePropertyId),
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      const safeError = buildError(error, 'No se pudieron cargar los likes.');
      console.error('Firestore subscribeToLikesCount error:', { propertyId: safePropertyId, error: safeError });
      if (typeof onError === 'function') {
        onError(safeError);
      }
    },
  );
}

export async function getUserLikeStatus(propertyId, uid) {
  const safePropertyId = validatePropertyId(propertyId);
  const safeUid = validateUid(uid);

  try {
    const snapshot = await getDoc(likeRef(safePropertyId, safeUid));
    return snapshot.exists();
  } catch (error) {
    console.error('Firestore getUserLikeStatus error:', { propertyId: safePropertyId, uid: safeUid, error });
    throw buildError(error, 'No se pudo validar el like del usuario.');
  }
}

export async function toggleLike(propertyId, user) {
  const safePropertyId = validatePropertyId(propertyId);
  const safeUser = validateAuthUser(user);
  const ref = likeRef(safePropertyId, safeUser.uid);

  try {
    const currentLike = await getDoc(ref);

    if (currentLike.exists()) {
      await deleteDoc(ref);
      return false;
    }

    await setDoc(ref, {
      uid: safeUser.uid,
      propertyId: safePropertyId,
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Firestore toggleLike error:', { propertyId: safePropertyId, uid: safeUser.uid, error });
    throw buildError(error, 'No se pudo actualizar el like.');
  }
}
