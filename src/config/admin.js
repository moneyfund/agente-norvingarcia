export const ALLOWED_ADMIN_EMAIL = 'agentenorvingarcia@gmail.com';

export function isAllowedAdminEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase() === ALLOWED_ADMIN_EMAIL;
}

export function hasAdminSession(claims) {
  return isAllowedAdminEmail(claims?.email)
    && claims.email_verified === true
    && claims.firebase?.sign_in_provider === 'google.com';
}
