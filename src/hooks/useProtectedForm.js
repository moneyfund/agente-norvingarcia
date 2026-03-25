import { useCallback, useState } from 'react';
import { createGeneralForm, createProtectedForm } from '../services/formulariosService';

export function useProtectedForm(user) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submitPropertyForm = useCallback(
    async (propertyId, payload) => {
      setSaving(true);
      setError('');
      try {
        await createProtectedForm(propertyId, payload, user);
      } catch (err) {
        setError(err.message || 'No se pudo enviar el formulario de la propiedad.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user],
  );

  const submitGeneralForm = useCallback(
    async (payload) => {
      setSaving(true);
      setError('');
      try {
        await createGeneralForm(payload, user);
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
    submitPropertyForm,
    submitGeneralForm,
  };
}
