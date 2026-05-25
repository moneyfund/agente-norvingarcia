import { auth } from '../firebase/config';

export function assertAllowedAdmin(user = auth.currentUser) {
  if (!user) {
    throw new Error('Debes iniciar sesión para acceder al panel admin.');
  }

  const hasGoogleProvider = user.providerData?.some((provider) => provider?.providerId === 'google.com');
  if (!hasGoogleProvider) {
    throw new Error('Acceso denegado. Debes iniciar sesión con Google.');
  }
}

export function isCurrentUserAllowedAdmin() {
  const user = auth.currentUser;
  return Boolean(user && user.providerData?.some((provider) => provider?.providerId === 'google.com'));
}
