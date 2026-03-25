import { useCallback, useEffect, useState } from 'react';
import { createComment, getCommentsByProperty } from '../services/commentsService';

export function usePropertyComments(propertyId, user) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!propertyId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const unsubscribe = getCommentsByProperty(
      propertyId,
      (data) => {
        setComments(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [propertyId]);

  const submitComment = useCallback(
    async (message) => {
      setSaving(true);
      setError('');
      try {
        await createComment(propertyId, { message }, user);
      } catch (err) {
        setError(err.message || 'No se pudo publicar el comentario.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [propertyId, user],
  );

  return { comments, loading, saving, error, submitComment };
}
