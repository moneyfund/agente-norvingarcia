import { collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

function likesCollectionRef(propertyId) {
  return collection(db, 'propiedades', propertyId, 'likes');
}

export function subscribeToLikes(propertyId, callback) {
  try {
    return onSnapshot(
      likesCollectionRef(propertyId),
      (snapshot) => {
        const likes = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        callback(likes);
      },
      (error) => {
        console.error('Error al escuchar likes de la propiedad', { propertyId, error });
      },
    );
  } catch (error) {
    console.error('Error al crear listener de likes', { propertyId, error });
    return () => {};
  }
}

export async function togglePropertyLike({ propertyId, user }) {
  const likeRef = doc(db, 'propiedades', propertyId, 'likes', user.uid);

  try {
    const currentLike = await getDoc(likeRef);

    if (currentLike.exists()) {
      await deleteDoc(likeRef);
      return false;
    }

    await setDoc(likeRef, {
      uid: user.uid,
      propertyId,
      displayName: user.displayName || user.email || 'Usuario',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error al alternar like', { propertyId, uid: user?.uid, error });
    throw error;
  }
}
