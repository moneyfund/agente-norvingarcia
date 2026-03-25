import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

function userData(user) {
  return {
    uid: user.uid,
    displayName: user.displayName || user.email || 'Usuario',
    email: user.email || '',
    photoURL: user.photoURL || '',
  };
}

export async function createPropertyForm({ propertyId, tipoFormulario, payload, user }) {
  try {
    const ref = collection(db, 'propiedades', propertyId, 'formularios');
    await addDoc(ref, {
      ...userData(user),
      propertyId,
      tipoFormulario,
      payload,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al enviar formulario protegido de propiedad', { propertyId, uid: user?.uid, error });
    throw error;
  }
}

export async function createGeneralForm({ tipoFormulario, payload, user }) {
  try {
    const ref = collection(db, 'formularios_generales');
    await addDoc(ref, {
      ...userData(user),
      tipoFormulario,
      payload,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al enviar formulario protegido general', { tipoFormulario, uid: user?.uid, error });
    throw error;
  }
}
