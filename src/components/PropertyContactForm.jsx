import { useState } from 'react';
import Button from './Button';
import Input from './Input';

const INITIAL_FORM = {
  phone: '',
  message: '',
};

function PropertyContactForm({ submitForm, submitting, error, success, isAuthenticated, loginWithGoogle }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      return;
    }

    await submitForm({
      phone: form.phone,
      message: form.message,
    });

    setForm(INITIAL_FORM);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Solicitar visita</h2>
      <p className="mt-2 text-slate-500">Este formulario es protegido y se guarda en la propiedad actual.</p>
      {!isAuthenticated && (
        <div className="mt-4 rounded-xl border border-brand-500/30 bg-brand-500/5 p-4">
          <p className="text-sm">Debes iniciar sesión para enviar la solicitud.</p>
          <Button className="mt-3" type="button" onClick={loginWithGoogle}>Iniciar sesión con Google</Button>
        </div>
      )}
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">Formulario enviado correctamente.</p>}
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <Input label="Teléfono" value={form.phone} onChange={handleChange('phone')} placeholder="Tu teléfono" />
        <label>
          <span className="mb-2 block text-sm font-medium">Mensaje</span>
          <textarea
            rows="4"
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Cuéntanos cuándo te gustaría visitar la propiedad"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <Button type="submit" disabled={!isAuthenticated || submitting}>{submitting ? 'Enviando...' : 'Enviar solicitud'}</Button>
      </form>
    </>
  );
}

export default PropertyContactForm;
