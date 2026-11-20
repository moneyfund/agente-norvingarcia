import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALLOWED_ADMIN_EMAIL, hasAdminSession, getAdminAccessStatus } from '../src/config/admin.js';
const allowed = { email: ALLOWED_ADMIN_EMAIL, email_verified: true, firebase: { sign_in_provider: 'google.com' } };
test('verified Google administrator is authorized', () => {
  assert.equal(getAdminAccessStatus(allowed), 'authorized');
  assert.equal(hasAdminSession(allowed), true);
});
test('other accounts cannot become administrators', () => {
  const outsider = { ...allowed, email: 'cliente@example.test' };
  assert.equal(getAdminAccessStatus(outsider), 'wrong-account');
  assert.equal(hasAdminSession(outsider), false);
});
test('unverified email and other providers remain blocked', () => {
  assert.equal(getAdminAccessStatus({ ...allowed, email_verified: false }), 'unverified-email');
  assert.equal(getAdminAccessStatus({ ...allowed, firebase: { sign_in_provider: 'password' } }), 'wrong-provider');
  assert.equal(hasAdminSession(null), false);
  assert.equal(hasAdminSession({ email: ALLOWED_ADMIN_EMAIL }), false);
});
