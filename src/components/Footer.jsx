import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Music2 } from 'lucide-react';

const social = [
  { icon: MessageCircle, href: 'https://wa.me/18095551234', label: 'WhatsApp' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Music2, href: 'https://tiktok.com', label: 'TikTok' },
];

function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-200">
      <div className="section-container grid gap-10 md:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl">Norvin García</h3>
          <p className="mt-3 text-sm text-slate-400">Asesoría inmobiliaria premium, acompañamiento integral y resultados con confianza.</p>
        </div>
        <div className="space-y-3 text-sm text-slate-300">
          <p className="flex items-center gap-2"><Phone size={15}/> +1 (809) 555-1234</p>
          <p className="flex items-center gap-2"><Mail size={15}/> norvin@inmobiliario.com</p>
          <p className="flex items-center gap-2"><MapPin size={15}/> Santo Domingo, República Dominicana</p>
        </div>
        <div className="flex gap-3">
          {social.map(({ icon: Icon, href, label }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="rounded-full bg-slate-800 p-3 transition hover:bg-brand-500" aria-label={label}><Icon size={18} /></a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
