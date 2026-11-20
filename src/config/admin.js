export const ALLOWED_ADMIN_EMAIL = 'agentenorvingarcia@gmail.com';

export function isAllowedAdminEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase() === ALLOWED_ADMIN_EMAIL;
}

export function getAdminAccessStatus(claims) {
  if (!isAllowedAdminEmail(claims?.email)) return 'wrong-account';
  if (claims.email_verified !== true) return 'unverified-email';
  if (claims.firebase?.sign_in_provider !== 'google.com') return 'wrong-provider';
  return 'authorized';
}

export function hasAdminSession(claims) {
  return getAdminAccessStatus(claims) === 'authorized';
}
