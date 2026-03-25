import {
  browserLocalPersistence,
  onAuthStateChanged,
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
  return onAuthStateChanged(auth, callback);
}

export async function initializeAuth() {
  await ensureAuthPersistence();
}
