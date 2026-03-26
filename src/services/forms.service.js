import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validatePropertyFormPayload, validatePropertyId } from './firestoreValidation';

export async function createPropertyForm(propertyId, user, payload) {
  const safePropertyId = validatePropertyId(propertyId);
  const safeUser = validateAuthUser(user);
  const safePayload = validatePropertyFormPayload(payload);

  try {
    const ref = collection(db, 'propiedades', safePropertyId, 'formularios');
    await addDoc(ref, {
      uid: safeUser.uid,
      userName: safeUser.userName,
      userEmail: safeUser.userEmail,
      userPhotoURL: safeUser.userPhotoURL,
      phone: safePayload.phone,
      message: safePayload.message,
      propertyId: safePropertyId,
      createdAt: serverTimestamp(),
      status: 'nuevo',
    });
  } catch (error) {
    console.error('Firestore createPropertyForm error:', { propertyId: safePropertyId, uid: safeUser.uid, error });
    throw buildError(error, 'No se pudo enviar el formulario de la propiedad.');
  }
}

export async function createGeneralForm(user, payload) {
  const safeUser = validateAuthUser(user);
  const safePayload = validatePropertyFormPayload(payload);

  try {
    const ref = collection(db, 'formularios');
    await addDoc(ref, {
      uid: safeUser.uid,
      userName: safeUser.userName,
      userEmail: safeUser.userEmail,
      userPhotoURL: safeUser.userPhotoURL,
      phone: safePayload.phone,
      message: safePayload.message,
      createdAt: serverTimestamp(),
      status: 'nuevo',
    });
  } catch (error) {
    console.error('Firestore createGeneralForm error:', { uid: safeUser.uid, error });
    throw buildError(error, 'No se pudo enviar el formulario general.');
  }
}
