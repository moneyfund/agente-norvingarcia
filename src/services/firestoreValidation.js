function assertString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`El campo ${fieldName} es obligatorio.`);
  }

  return value.trim();
}

export function validatePropertyId(propertyId) {
  return assertString(propertyId, 'propertyId');
}

export function validateUid(uid) {
  return assertString(uid, 'uid');
}

export function validateAuthUser(user) {
  if (!user?.uid) {
    throw new Error('Debes iniciar sesión para realizar esta acción.');
  }

  return {
    uid: user.uid,
    userName: user.displayName || user.email || 'Usuario',
    userEmail: user.email || '',
    userPhotoURL: user.photoURL || '',
  };
}

export function validateContent(content, label = 'contenido') {
  return assertString(content, label);
}

export function validateRating(rating) {
  const parsedRating = Number(rating);

  if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    throw new Error('La reseña debe incluir una calificación válida entre 1 y 5.');
  }

  return parsedRating;
}

export function validatePropertyFormPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('El formulario debe incluir un payload válido.');
  }

  return {
    phone: assertString(payload.phone, 'phone'),
    message: assertString(payload.message, 'message'),
  };
}

export function buildError(error, fallbackMessage) {
  return new Error(error?.message || fallbackMessage);
}
