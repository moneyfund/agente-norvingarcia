import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function upsertUserProfile(firebaseUser) {
  if (!firebaseUser) return;

  const userRef = doc(db, 'users', firebaseUser.uid);
  await setDoc(
    userRef,
    {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || '',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || '',
      provider: firebaseUser.providerData?.[0]?.providerId || 'google.com',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true },
  );
}
