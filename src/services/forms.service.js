import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validatePropertyFormPayload, validatePropertyId } from './firestoreValidation';

export async function createProtectedPropertyForm(propertyId, user, payload) {
  const safePropertyId = validatePropertyId(propertyId);
  const safeUser = validateAuthUser(user);
  const safePayload = validatePropertyFormPayload(payload);

  console.log('createProtectedPropertyForm propertyId:', safePropertyId);
  console.log('auth user:', safeUser.uid);

  try {
    const ref = collection(db, 'propiedades', safePropertyId, 'formularios');
    await addDoc(ref, {
      uid: safeUser.uid,
      userName: safeUser.userName,
      userEmail: safeUser.userEmail,
      phone: safePayload.phone,
      message: safePayload.message,
      propertyId: safePropertyId,
      createdAt: serverTimestamp(),
      status: 'enviado',
    });
  } catch (error) {
    console.error('Firestore createProtectedPropertyForm error:', { propertyId: safePropertyId, uid: safeUser.uid, error });
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
      phone: safePayload.phone,
      message: safePayload.message,
      createdAt: serverTimestamp(),
      status: 'enviado',
    });
  } catch (error) {
    console.error('Firestore createGeneralForm error:', { uid: safeUser.uid, error });
    throw buildError(error, 'No se pudo enviar el formulario general.');
  }
}
