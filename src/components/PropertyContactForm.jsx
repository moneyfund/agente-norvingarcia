import { useState } from 'react';
import FormLogin from './FormLogin';
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
      {!isAuthenticated && <FormLogin onLogin={loginWithGoogle}>Inicia sesión para enviar tu solicitud de visita.</FormLogin>}
      {error && <p className="ng-inline-error" role="alert">{error}</p>}
      {success && <p className="ng-meta" role="status">Solicitud enviada correctamente.</p>}
      <form className="ng-form ng-visit-form" onSubmit={handleSubmit}>
        <Input label="Teléfono" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange('phone')} placeholder="Tu teléfono" />
        <label>
          <span>Mensaje</span>
          <textarea
            rows="4"
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Cuéntanos cuándo te gustaría visitar la propiedad"
          />
        </label>
        <button className="ng-button ng-button--wine" type="submit" disabled={!isAuthenticated || submitting}>{submitting ? 'Enviando…' : 'Enviar solicitud'}</button>
      </form>
    </>
  );
}

export default PropertyContactForm;
