import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildError, validateAuthUser, validateFormPayload, validatePropertyId } from './firestoreValidation';

export async function createProtectedForm(propertyId, payload, user) {
  const safePropertyId = validatePropertyId(propertyId);
  const safePayload = validateFormPayload(payload);
  const safeUser = validateAuthUser(user);

  try {
    const ref = collection(db, 'propiedades', safePropertyId, 'formularios');
    await addDoc(ref, {
      ...safeUser,
      propertyId: safePropertyId,
      content: safePayload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'enviado',
    });
  } catch (error) {
    console.error('Error al enviar formulario de propiedad', { propertyId: safePropertyId, uid: safeUser.uid, error });
    throw buildError(error, 'No se pudo enviar el formulario de la propiedad.');
  }
}

export async function createGeneralForm(payload, user) {
  const safePayload = validateFormPayload(payload);
  const safeUser = validateAuthUser(user);

  try {
    const ref = collection(db, 'formularios');
    await addDoc(ref, {
      ...safeUser,
      content: safePayload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'enviado',
    });
  } catch (error) {
    console.error('Error al enviar formulario general', { uid: safeUser.uid, error });
    throw buildError(error, 'No se pudo enviar el formulario general.');
  }
}
