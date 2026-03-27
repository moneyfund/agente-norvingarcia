import { auth } from '../firebase/config';
import { ALLOWED_ADMIN_EMAIL, isAllowedAdminEmail } from '../config/admin';

export function assertAllowedAdmin(user = auth.currentUser) {
  if (!user) {
    throw new Error('Debes iniciar sesión para acceder al panel admin.');
  }

  if (!isAllowedAdminEmail(user.email)) {
    throw new Error(`Acceso denegado. Solo ${ALLOWED_ADMIN_EMAIL} puede administrar.`);
  }
}

export function isCurrentUserAllowedAdmin() {
  const user = auth.currentUser;
  return Boolean(user && isAllowedAdminEmail(user.email));
}
