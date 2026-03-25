import { collection, deleteDoc, doc, getCountFromServer, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validatePropertyId, validateUid } from './firestoreValidation';

function likesCollectionRef(propertyId) {
  return collection(db, 'propiedades', propertyId, 'likes');
}

function likeRef(propertyId, uid) {
  return doc(db, 'propiedades', propertyId, 'likes', uid);
}

export function subscribeToLikes(propertyId, callback) {
  const safePropertyId = validatePropertyId(propertyId);

  return onSnapshot(
    likesCollectionRef(safePropertyId),
    (snapshot) => {
      const likes = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      callback(likes);
    },
    (error) => {
      console.error('Firestore subscribeToLikes error:', { propertyId: safePropertyId, error });
    },
  );
}

export async function toggleLike(propertyId, user) {
  const safePropertyId = validatePropertyId(propertyId);
  const safeUser = validateAuthUser(user);
  const ref = likeRef(safePropertyId, safeUser.uid);

  console.log('toggleLike propertyId:', safePropertyId);
  console.log('auth user:', safeUser.uid);

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

export async function getLikesCount(propertyId) {
  const safePropertyId = validatePropertyId(propertyId);

  try {
    const snapshot = await getCountFromServer(likesCollectionRef(safePropertyId));
    return snapshot.data().count;
  } catch (error) {
    console.error('Firestore getLikesCount error:', { propertyId: safePropertyId, error });
    throw buildError(error, 'No se pudo obtener el total de likes.');
  }
}

export async function hasUserLiked(propertyId, uid) {
  const safePropertyId = validatePropertyId(propertyId);
  const safeUid = validateUid(uid);

  try {
    const snapshot = await getDoc(likeRef(safePropertyId, safeUid));
    return snapshot.exists();
  } catch (error) {
    console.error('Firestore hasUserLiked error:', { propertyId: safePropertyId, uid: safeUid, error });
    throw buildError(error, 'No se pudo validar el like del usuario.');
  }
}
