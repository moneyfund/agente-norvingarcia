import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import FormLogin from '../components/FormLogin';
import PageMasthead from '../components/PageMasthead';
import { contact } from '../config/brand';
import Input from '../components/Input';
import Seo from '../components/Seo';
import { useAuth } from '../hooks/useAuth';
import { useProtectedForm } from '../hooks/useProtectedForm';

const INITIAL_FORM = {
  name: '',
  phone: '',
  email: '',
  propertyType: '',
  description: '',
};

function SellPage() {
  const { isAuthenticated, user, loginWithGoogle } = useAuth();
  const [statusMessage, setStatusMessage] = useState('');
  const { submitGeneralForm, saving, error } = useProtectedForm(user);
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated || !user) {
      setStatusMessage('Debes iniciar sesión para enviar esta solicitud.');
      return;
    }

    try {
      await submitGeneralForm({
        phone: form.phone,
        message: `Solicitud de venta de ${form.name || user.displayName || ''} (${form.email || user.email || ''}) | Tipo: ${form.propertyType} | Descripción: ${form.description}` ,
      });

      setForm(INITIAL_FORM);
      setStatusMessage(`Solicitud enviada correctamente. Gracias, ${user?.displayName || 'usuario'}.`);
    } catch (error) {
      setStatusMessage(error.message || 'No se pudo enviar la solicitud.');
    }
  };

  return (
    <>
      <Seo title="Vender una propiedad | Norvin García" description="Solicita asesoría para vender una propiedad en Nicaragua con Norvin García." />
      <PageMasthead variant="owners" label="Asesoría para propietarios" title="Vender tu propiedad">
        Cuéntame sobre el inmueble y qué buscas lograr con la venta.
      </PageMasthead>
      <div className="ng-wrap ng-service-layout">
        <aside className="ng-service-aside">
          <h2 className="ng-display">Cómo empezamos</h2>
          <ol className="ng-sell-steps">
            <li><strong>Conocemos el inmueble.</strong><p>Revisamos su ubicación, superficie, estado y documentación disponible.</p></li>
            <li><strong>Definimos la estrategia.</strong><p>Evaluamos propiedades comparables y acordamos un plan para presentar tu inmueble.</p></li>
            <li><strong>Coordinamos el proceso.</strong><p>Organizamos consultas, visitas y seguimiento con interesados.</p></li>
          </ol>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="ng-button ng-button--line"><MessageCircle size={18} aria-hidden="true" /> Consultar por WhatsApp</a>
        </aside>
        <form onSubmit={handleSubmit} className="ng-form ng-form-panel">
          <h2 className="ng-display">Solicitud de venta</h2>
          {!isAuthenticated && <FormLogin onLogin={loginWithGoogle}>Inicia sesión para enviar tu solicitud.</FormLogin>}
          <div className="ng-form-row">
            <Input label="Nombre" autoComplete="name" value={form.name || user?.displayName || ''} onChange={handleChange('name')} />
            <Input label="Teléfono" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange('phone')} />
          </div>
          <div className="ng-form-row">
            <Input label="Correo electrónico" type="email" autoComplete="email" value={form.email || user?.email || ''} onChange={handleChange('email')} />
            <Input label="Tipo de propiedad" placeholder="Casa, terreno, finca…" value={form.propertyType} onChange={handleChange('propertyType')} />
          </div>
          <label><span>Descripción</span><textarea rows="5" placeholder="Ubicación, superficie y detalles que quieras compartir" value={form.description} onChange={handleChange('description')} /></label>
          {statusMessage && <p className="ng-meta" role="status">{statusMessage}</p>}
          {error && <p className="ng-inline-error" role="alert">{error}</p>}
          <button className="ng-button ng-button--wine" type="submit" disabled={!isAuthenticated || saving}>{saving ? 'Enviando…' : 'Enviar solicitud'}</button>
        </form>
      </div>
    </>
  );
}

export default SellPage;
