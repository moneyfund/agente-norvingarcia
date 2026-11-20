import { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import FormLogin from '../components/FormLogin';
import Input from '../components/Input';
import PageMasthead from '../components/PageMasthead';
import PropertyLocation from '../components/PropertyLocation';
import Seo from '../components/Seo';
import { socialLinks } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { useProtectedForm } from '../hooks/useProtectedForm';
import { contact, nicaraguaCenter } from '../config/brand';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

function ContactPage() {
  const { isAuthenticated, user, loginWithGoogle } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [statusMessage, setStatusMessage] = useState('');
  const { submitGeneralForm, saving, error } = useProtectedForm(user);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated || !user) {
      setStatusMessage('Debes iniciar sesión para enviar este formulario de contacto.');
      return;
    }

    try {
      await submitGeneralForm({
        phone: form.phone,
        message: `Contacto de ${form.name || user.displayName || ''} (${form.email || user.email || ''}): ${form.message}` ,
      });

      setStatusMessage('Mensaje enviado correctamente. Te responderemos pronto.');
      setForm(INITIAL_FORM);
    } catch (error) {
      setStatusMessage(error.message || 'No se pudo enviar el mensaje.');
    }
  };

  return (
    <>
      <Seo title="Contacto | Norvin García" description="Contacta con Norvin García por WhatsApp, correo o redes sociales." />
      <PageMasthead variant="contact" label="Norvin García · Bienes raíces" title="Contacto">
        Cuéntame qué quieres comprar, vender o consultar en Nicaragua.
      </PageMasthead>
      <div className="ng-wrap ng-service-layout">
        <aside className="ng-service-aside">
          <h2 className="ng-display">Contacto directo</h2>
          <a className="ng-button ng-button--wine" href={contact.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" /> Escribir por WhatsApp</a>
          <div className="ng-contact-methods">
            <a href={contact.phoneHref}><Phone size={17} aria-hidden="true" /> {contact.phone}</a>
            <a href={`mailto:${contact.email}`}><Mail size={17} aria-hidden="true" /> {contact.email}</a>
            <p><MapPin size={17} aria-hidden="true" /> Nicaragua</p>
          </div>
          <div className="ng-social">
            {socialLinks.map(({ icon: Icon, href, label }) => <a key={label} href={href} target="_blank" rel="noreferrer" className="ng-icon-button" aria-label={label}><Icon size={18} aria-hidden="true" /></a>)}
          </div>
        </aside>
        <form onSubmit={handleSubmit} className="ng-form ng-form-panel">
          <h2 className="ng-display">Envíame un mensaje</h2>
          {!isAuthenticated && <FormLogin onLogin={loginWithGoogle}>Inicia sesión para enviar tu mensaje.</FormLogin>}
          <div className="ng-form-row">
            <Input label="Nombre" autoComplete="name" value={form.name || user?.displayName || ''} onChange={handleChange('name')} />
            <Input label="Correo electrónico" autoComplete="email" type="email" value={form.email || user?.email || ''} onChange={handleChange('email')} />
          </div>
          <Input label="Teléfono" autoComplete="tel" type="tel" value={form.phone} onChange={handleChange('phone')} />
          <label><span>Mensaje</span><textarea rows="5" value={form.message} onChange={handleChange('message')} /></label>
          {statusMessage && <p className="ng-meta" role="status">{statusMessage}</p>}
          {error && <p className="ng-inline-error" role="alert">{error}</p>}
          <button className="ng-button ng-button--wine" type="submit" disabled={!isAuthenticated || saving}>{saving ? 'Enviando…' : 'Enviar mensaje'}</button>
        </form>
        <section className="ng-contact-map">
          <h2 className="ng-display">Zona de atención</h2>
          <div className="ng-map-frame"><PropertyLocation coordinates={nicaraguaCenter} zoom={7} showMarker={false} /></div>
        </section>
      </div>
    </>
  );
}

export default ContactPage;
