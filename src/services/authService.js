import {
  browserLocalPersistence,
  onIdTokenChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

let persistenceInitialized = false;

async function ensureAuthPersistence() {
  if (persistenceInitialized) return;
  await setPersistence(auth, browserLocalPersistence);
  persistenceInitialized = true;
}

export async function signInWithGoogle() {
  await ensureAuthPersistence();
  return signInWithPopup(auth, googleProvider);
}

export async function logoutUser() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onIdTokenChanged(auth, callback);
}

export async function initializeAuth() {
  await ensureAuthPersistence();
}
