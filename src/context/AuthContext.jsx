import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initializeAuth, logoutUser, onAuthChange, signInWithGoogle } from '../services/authService';
import { auth } from '../firebase/config';
import { upsertUserProfile } from '../services/userService';
import { getAdminAccessStatus, isAllowedAdminEmail } from '../config/admin';

export const AuthContext = createContext(null);
const anonymous = { user: null, isAdmin: false, loading: false, adminStatus: 'signed-out' };

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ ...anonymous, loading: true, adminStatus: 'checking' });
  const generation = useRef(0);
  const mounted = useRef(false);

  const validateSession = useCallback(async (user, refresh = false) => {
    const version = ++generation.current;
    if (!mounted.current) return;
    if (!user) {
      setSession(anonymous);
      return;
    }
    if (!isAllowedAdminEmail(user.email)) {
      setSession({ user, isAdmin: false, loading: false, adminStatus: 'wrong-account' });
      return;
    }

    // Never authorize from the client profile alone. The ID token must meet
    // exactly the same requirements as the repository's Firebase rules.
    setSession(current => current.user?.uid === user.uid && current.isAdmin && !refresh
      ? { ...current, user }
      : { user, isAdmin: false, loading: true, adminStatus: 'checking' });

    let adminStatus = 'token-error';
    try {
      const result = await user.getIdTokenResult(refresh);
      adminStatus = getAdminAccessStatus(result.claims);
    } catch {
      // Fail closed; the login page provides a retry rather than a redirect loop.
    }
    if (mounted.current && generation.current === version && auth.currentUser?.uid === user.uid) {
      setSession({ user, isAdmin: adminStatus === 'authorized', loading: false, adminStatus });
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    let lastProfileUid;
    // Subscribe immediately so restoring or changing persistence cannot hide
    // a successful Google sign-in from the route guard.
    const unsubscribe = onAuthChange(user => {
      void validateSession(user);
      if (user && user.uid !== lastProfileUid) {
        lastProfileUid = user.uid;
        upsertUserProfile(user).catch(() => {});
      }
      if (!user) lastProfileUid = undefined;
    }, () => {
      ++generation.current;
      if (mounted.current) setSession({ ...anonymous, user: auth.currentUser, adminStatus: 'token-error' });
    });
    void initializeAuth();
    return () => {
      mounted.current = false;
      ++generation.current;
      unsubscribe();
    };
  }, [validateSession]);

  const loginWithGoogle = useCallback(async () => {
    const credential = await signInWithGoogle();
    // Also validate the returned credential explicitly; do not depend solely
    // on the timing of the Firebase observer for navigation.
    if (auth.currentUser?.uid === credential.user.uid) {
      await validateSession(credential.user);
    }
    return credential;
  }, [validateSession]);

  const retryAdminAccess = useCallback(() => validateSession(auth.currentUser, true), [validateSession]);

  const value = useMemo(() => ({
    ...session,
    isAuthenticated: Boolean(session.user),
    role: session.user ? (session.isAdmin ? 'admin' : 'cliente') : null,
    loginWithGoogle,
    retryAdminAccess,
    logout: logoutUser,
  }), [session, loginWithGoogle, retryAdminAccess]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
