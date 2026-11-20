import { createContext, useEffect, useMemo, useState } from 'react';
import { initializeAuth, logoutUser, onAuthChange, signInWithGoogle } from '../services/authService';
import { upsertUserProfile } from '../services/userService';
import { hasAdminSession, isAllowedAdminEmail } from '../config/admin';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ user: null, isAdmin: false, loading: true });

  useEffect(() => {
    let active = true;
    let change = 0;
    let unsubscribe;
    let lastProfileUid;
    async function start() {
      try {
        await initializeAuth();
      } catch {
        // The Auth SDK can still restore an in-memory session.
      }
      if (!active) return;
      unsubscribe = onAuthChange(async (user) => {
        const version = ++change;
        const candidate = Boolean(user?.emailVerified && isAllowedAdminEmail(user.email));
        setSession((current) => candidate && current.user?.uid === user.uid
          ? { ...current, user }
          : { user, isAdmin: false, loading: candidate });
        if (user && user.uid !== lastProfileUid) {
          lastProfileUid = user.uid;
          upsertUserProfile(user).catch(() => {});
        }
        if (!user) lastProfileUid = undefined;
        if (!candidate) return;
        let isAdmin = false;
        try {
          isAdmin = hasAdminSession((await user.getIdTokenResult()).claims);
        } catch {
          // Private routes stay closed until a valid ID token is available.
        }
        if (active && version === change) setSession({ user, isAdmin, loading: false });
      });
    }
    start();
    return () => { active = false; unsubscribe?.(); };
  }, []);

  const value = useMemo(() => ({
    ...session,
    isAuthenticated: Boolean(session.user),
    role: session.user ? (session.isAdmin ? 'admin' : 'cliente') : null,
    loginWithGoogle: signInWithGoogle,
    logout: logoutUser,
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
