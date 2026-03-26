import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { createComment, subscribeToComments } from '../services/comments.service';

export function usePropertyComments(propertyId) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!propertyId) {
      setComments([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setError('');

    const unsubscribe = subscribeToComments(propertyId, (data) => {
      setComments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [propertyId]);

  const submitComment = useCallback(
    async (content) => {
      setSubmitting(true);
      setError('');
      try {
        await createComment(propertyId, user, content);
      } catch (err) {
        setError(err.message || 'No se pudo publicar el comentario.');
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [propertyId, user],
  );

  return { comments, loading, error, submitComment, submitting };
}
