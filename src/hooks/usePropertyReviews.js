import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { createReview, subscribeToReviews } from '../services/reviews.service';

export function usePropertyReviews(propertyId) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!propertyId) {
      setReviews([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setError('');

    const unsubscribe = subscribeToReviews(propertyId, (data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [propertyId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  const submitReview = useCallback(
    async (rating, content) => {
      setSubmitting(true);
      setError('');
      try {
        await createReview(propertyId, user, rating, content);
      } catch (err) {
        setError(err.message || 'No se pudo publicar la reseña.');
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [propertyId, user],
  );

  return { reviews, averageRating, loading, error, submitReview, submitting };
}
