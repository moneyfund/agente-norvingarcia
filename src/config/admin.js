export const ALLOWED_ADMIN_EMAIL = 'agentenorvingarcia@gmail.com';

export function normalizeEmail(email = '') {
  return String(email || '').trim().toLowerCase();
}

export function isAllowedAdminEmail(email) {
  return normalizeEmail(email) === ALLOWED_ADMIN_EMAIL;
}
