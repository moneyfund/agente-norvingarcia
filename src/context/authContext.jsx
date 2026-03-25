import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const ensureUserDocument = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return;
    const userRef = doc(db, 'usuarios', firebaseUser.uid);
    const userSnapshot = await getDoc(userRef);
    const payload = {
      uid: firebaseUser.uid,
      nombre: firebaseUser.displayName || '',
      email: firebaseUser.email || '',
      foto: firebaseUser.photoURL || '',
    };

    if (!userSnapshot.exists()) {
      await setDoc(userRef, {
        ...payload,
        createdAt: serverTimestamp(),
      });
      return;
    }

    await setDoc(userRef, payload, { merge: true });
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    loginWithGoogle: async () => {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await ensureUserDocument(result.user);
      return result;
    },
    logout: () => signOut(auth),
  }), [ensureUserDocument, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
