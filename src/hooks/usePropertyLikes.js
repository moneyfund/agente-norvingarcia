import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getUserLikeStatus, subscribeToLikesCount, toggleLike } from '../services/likes.service';

export function usePropertyLikes(propertyId) {
  const { user, isAuthenticated } = useAuth();
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!propertyId) {
      setLikesCount(0);
      setHasLiked(false);
      setLoading(false);
      return () => {};
    }

    setError('');
    setLoading(true);

    const unsubscribe = subscribeToLikesCount(
      propertyId,
      (count) => {
        setLikesCount(count);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'No se pudieron cargar los likes.');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [propertyId]);

  useEffect(() => {
    let cancelled = false;

    const resolveStatus = async () => {
      if (!propertyId || !user?.uid) {
        setHasLiked(false);
        return;
      }

      try {
        const liked = await getUserLikeStatus(propertyId, user.uid);
        if (!cancelled) {
          setHasLiked(liked);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'No se pudo validar tu like.');
        }
      }
    };

    resolveStatus();

    return () => {
      cancelled = true;
    };
  }, [propertyId, user?.uid]);

  const toggle = useCallback(async () => {
    if (!isAuthenticated || !user) {
      throw new Error('Debes iniciar sesión para dar like.');
    }

    setError('');
    setLoading(true);

    try {
      const liked = await toggleLike(propertyId, user);
      setHasLiked(liked);
      return liked;
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el like.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, propertyId, user]);

  return { likesCount, hasLiked, loading, error, toggle };
}
