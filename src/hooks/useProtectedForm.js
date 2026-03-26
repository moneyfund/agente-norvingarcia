import { useCallback, useState } from 'react';
import { createGeneralForm } from '../services/forms.service';

export function useProtectedForm(user) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submitGeneralForm = useCallback(
    async (payload) => {
      setSaving(true);
      setError('');
      try {
        await createGeneralForm(user, payload);
      } catch (err) {
        setError(err.message || 'No se pudo enviar el formulario general.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user],
  );

  return {
    saving,
    error,
    submitGeneralForm,
  };
}
