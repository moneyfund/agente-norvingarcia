import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { initializeAuth, logoutUser, onAuthChange, signInWithGoogle } from '../services/authService';
import { upsertUserProfile } from '../services/userService';
import { isAllowedAdminEmail } from '../config/admin';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleGoogleLogin = useCallback(async () => {
    const result = await signInWithGoogle();
    if (result?.user) {
      await upsertUserProfile(result.user);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logoutUser();
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    const setup = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Error al configurar persistencia de auth', error);
      }

      unsubscribe = onAuthChange(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            await upsertUserProfile(firebaseUser);
          } catch (error) {
            console.error('Error al sincronizar perfil de usuario', error);
          }
        }

        setUser(firebaseUser);
        setLoading(false);
      });
    };

    setup();

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: isAllowedAdminEmail(user?.email),
      loginWithGoogle: handleGoogleLogin,
      logout: handleLogout,
    }),
    [handleGoogleLogin, handleLogout, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
