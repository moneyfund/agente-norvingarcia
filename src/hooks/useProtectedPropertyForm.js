import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { createPropertyForm } from '../services/forms.service';

export function useProtectedPropertyForm(propertyId) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submitForm = useCallback(
    async ({ phone, message }) => {
      setSubmitting(true);
      setError('');
      setSuccess(false);

      try {
        await createPropertyForm(propertyId, user, { phone, message });
        setSuccess(true);
      } catch (err) {
        setError(err.message || 'No se pudo enviar el formulario.');
        setSuccess(false);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [propertyId, user],
  );

  return { submitForm, submitting, error, success };
}
