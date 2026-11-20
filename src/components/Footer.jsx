import { Facebook, Instagram, MessageCircle, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contact } from '../config/brand';
import BrandMark from './BrandMark';

export const socialLinks = [
  { icon: MessageCircle, href: contact.whatsapp, label: 'WhatsApp' },
  { icon: Facebook, href: contact.facebook, label: 'Facebook' },
  { icon: Instagram, href: contact.instagram, label: 'Instagram' },
  { icon: Music2, href: contact.tiktok, label: 'TikTok' },
];

function Footer() {
  return (
    <footer className="ng-footer">
      <div className="ng-wrap ng-footer-main">
        <div className="ng-footer-brand">
          <BrandMark />
          <p>Agente inmobiliario en Nicaragua<br />Diamantes Realty Group</p>
        </div>
        <nav aria-label="Explorar">
          <h2 className="ng-label">Explorar</h2>
          <Link to="/propiedades">Propiedades</Link>
          <Link to="/mapa">Mapa inmobiliario</Link>
          <Link to="/quieres-vender">Vender mi propiedad</Link>
          <Link to="/educacion">Educación inmobiliaria</Link>
        </nav>
        <div>
          <h2 className="ng-label">Contacto</h2>
          <a href={contact.phoneHref}>{contact.phone}</a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <div className="ng-social">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="ng-icon-button" aria-label={label}>
                <Icon size={17} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="ng-wrap ng-footer-base">
        <p>© {new Date().getFullYear()} Norvin García</p>
        <Link to="/contacto">Asesoría inmobiliaria en Nicaragua</Link>
      </div>
    </footer>
  );
}

export default Footer;
