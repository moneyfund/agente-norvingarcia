function assertString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`El campo ${fieldName} es obligatorio.`);
  }

  return value.trim();
}

export function validatePropertyId(propertyId) {
  return assertString(propertyId, 'propertyId');
}

export function validateAuthUser(user) {
  if (!user?.uid) {
    throw new Error('Debes iniciar sesión para realizar esta acción.');
  }

  return {
    uid: user.uid,
    userId: user.uid,
    userName: user.displayName || user.email || 'Usuario',
    userEmail: user.email || '',
    userPhotoURL: user.photoURL || '',
  };
}

export function validateCommentPayload(payload) {
  return {
    message: assertString(payload?.message, 'message'),
  };
}

export function validateReviewPayload(payload) {
  const message = assertString(payload?.message, 'message');
  const rating = Number(payload?.rating);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error('La reseña debe incluir una calificación válida entre 1 y 5.');
  }

  return { message, rating };
}

export function validateFormPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('El formulario debe incluir un payload válido.');
  }

  return payload;
}

export function buildError(error, fallbackMessage) {
  return new Error(error?.message || fallbackMessage);
}
