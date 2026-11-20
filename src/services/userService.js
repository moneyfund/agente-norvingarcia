import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function upsertUserProfile(user) {
  if (!user) return;
  const profile = doc(db, 'users', user.uid);
  await runTransaction(db, async (transaction) => {
    const previous = await transaction.get(profile);
    transaction.set(profile, {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      provider: user.providerData?.[0]?.providerId || 'google.com',
      ...(!previous.exists() && { createdAt: serverTimestamp() }),
      lastLoginAt: serverTimestamp(),
    }, { merge: true });
  });
}
