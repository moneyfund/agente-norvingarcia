import { auth } from '../firebase/config';
import { isAllowedAdminEmail } from '../config/admin';

export function isCurrentUserAllowedAdmin(user = auth.currentUser) {
  return Boolean(user?.emailVerified && isAllowedAdminEmail(user.email)
    && user.providerData?.some(({ providerId }) => providerId === 'google.com'));
}

export function assertAllowedAdmin(user = auth.currentUser) {
  if (!isCurrentUserAllowedAdmin(user)) {
    throw new Error('Se necesita la cuenta administrativa autorizada.');
  }
}
