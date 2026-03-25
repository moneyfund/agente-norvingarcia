import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, getRedirectResult, onAuthStateChanged, signInWithEmailAndPassword, signInWithRedirect, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await ensureUserDocument(result.user);
          console.log('Usuario logueado:', result.user);
        }
      })
      .catch((error) => {
        console.error('Error login:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await ensureUserDocument(firebaseUser);
        }
      } catch (error) {
        console.error('Error guardando usuario:', error);
      } finally {
        setUser(firebaseUser);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [ensureUserDocument]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    loginWithGoogle: () => {
      const provider = new GoogleAuthProvider();
      return signInWithRedirect(auth, provider);
    },
    logout: () => signOut(auth),
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
