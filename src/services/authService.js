import {
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  onIdTokenChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

let persistencePromise;

function ensureAuthPersistence() {
  if (!persistencePromise) {
    persistencePromise = (async () => {
      for (const persistence of [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence]) {
        try {
          await setPersistence(auth, persistence);
          return;
        } catch {
          // Try another supported persistence without blocking Google login.
        }
      }
    })();
  }
  return persistencePromise;
}

export function signInWithGoogle() {
  // Call the popup directly from the user's click; Auth queues initialization.
  return signInWithPopup(auth, googleProvider);
}

export function logoutUser() {
  return signOut(auth);
}

export function onAuthChange(callback, onError) {
  return onIdTokenChanged(auth, callback, onError);
}

export function initializeAuth() {
  return ensureAuthPersistence();
}
