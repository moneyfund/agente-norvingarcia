import { useEffect, useState } from 'react';
import { Building2, Handshake, MapPinned, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { socialLinks } from '../components/Footer';
import { contact } from '../config/brand';
import { getAgente } from '../services/agentesService';

const approach = [
  { icon: MapPinned, title: 'Conocer el mercado', description: 'Comparo ubicación, características y oferta disponible para entender qué hace valiosa a cada propiedad.' },
  { icon: ShieldCheck, title: 'Revisar la información', description: 'Identifico qué datos y documentos conviene verificar antes de avanzar con una compra o venta.' },
  { icon: Handshake, title: 'Acompañar la negociación', description: 'Te ayudo a definir las condiciones que te importan y a tomar decisiones durante el proceso.' },
];

function AboutPage() {
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    let active = true;
    getAgente().then((profile) => { if (active) setAgent(profile); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const links = { WhatsApp: agent?.whatsapp, Facebook: agent?.facebook, Instagram: agent?.instagram, TikTok: agent?.tiktok };

  return (
    <>
      <Seo title="Sobre mí | Norvin García" description="Conoce a Norvin García, asesor inmobiliario en Nicaragua y agente de Diamantes Realty Group." />
      <section className="ng-about-hero">
        <div className="ng-wrap ng-about-grid">
          <div className="ng-about-copy">
            <p className="ng-label">El agente · Matagalpa, Nicaragua</p>
            <h1 className="ng-display">Norvin <em>García</em></h1>
            <p className="ng-about-affiliation"><Building2 size={18} aria-hidden="true" /> Diamantes Realty Group</p>
            <p>{agent?.biografia || 'Acompaño a propietarios, compradores e inversionistas en Nicaragua. Mi trabajo empieza por entender tus objetivos y ayudarte a evaluar tus opciones con información clara.'}</p>
            <a href={agent?.whatsapp || contact.whatsapp} target="_blank" rel="noreferrer" className="ng-button ng-button--wine"><MessageCircle size={18} aria-hidden="true" /> Hablemos de tu propiedad</a>
            <div className="ng-social">
              {socialLinks.map(({ icon: Icon, href, label }) => <a key={label} href={links[label] || href} className="ng-icon-button" target="_blank" rel="noreferrer" aria-label={label}><Icon size={17} aria-hidden="true" /></a>)}
            </div>
          </div>
          <figure className="ng-about-portrait">
            <img
              src={agent?.foto || '/img/norvin-garcia.webp'}
              alt="Norvin García, asesor inmobiliario"
              decoding="async"
              onError={(event) => { if (!event.currentTarget.src.endsWith('/img/norvin-garcia.webp')) event.currentTarget.src = '/img/norvin-garcia.webp'; }}
            />
          </figure>
        </div>
      </section>
      <section className="ng-wrap ng-about-story">
        <div>
          <p className="ng-label ng-section-label">Mi trayectoria</p>
          <h2 className="ng-display">Una asesoría que empieza por escucharte.</h2>
        </div>
        <div>
          <p>Me dediqué al sector inmobiliario al ver cuánto puede cambiar una operación cuando una familia o un inversionista cuenta con información a tiempo.</p>
          <p>Si vendes, preparo una estrategia para presentar el inmueble a compradores. Si compras, revisamos juntos si la propiedad encaja con tu presupuesto, el uso que le darás y lo que proyectas a futuro.</p>
          <Link className="ng-text-link" to="/propiedades">Explorar el catálogo</Link>
        </div>
      </section>
      <section className="ng-about-approach">
        <div className="ng-wrap">
          <h2 className="ng-display">Cómo trabajo</h2>
          <div>
            {approach.map(({ icon: Icon, title, description }) => (
              <article key={title}>
                <Icon size={21} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutPage;
