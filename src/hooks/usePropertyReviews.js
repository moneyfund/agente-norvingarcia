import { useCallback, useEffect, useState } from 'react';
import { createReview, getReviewsByProperty } from '../services/reviews.service';

export function usePropertyReviews(propertyId, user) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!propertyId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const unsubscribe = getReviewsByProperty(
      propertyId,
      (data) => {
        setReviews(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [propertyId]);

  const submitReview = useCallback(
    async ({ rating, message }) => {
      setSaving(true);
      setError('');
      try {
        await createReview(propertyId, user, rating, message);
      } catch (err) {
        setError(err.message || 'No se pudo publicar la reseña.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [propertyId, user],
  );

  return { reviews, loading, saving, error, submitReview };
}
