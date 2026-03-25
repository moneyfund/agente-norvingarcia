import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Music2 } from 'lucide-react';

const social = [
  { icon: MessageCircle, href: 'https://wa.me/50587446657', label: 'WhatsApp' },
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=100092228811002', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/norgarciabr?igsh=cWZobXN6eWtuaWJq', label: 'Instagram' },
  { icon: Music2, href: 'https://www.tiktok.com/@norvin.garca.br?_r=1&_t=ZS-94ydmdWwrxd', label: 'TikTok' },
];

function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-200">
      <div className="section-container grid gap-10 md:grid-cols-3">
        <div>
          <img src="/LOGO DIAMANTES.png" className="h-6 w-auto mb-2" />
          <h3 className="font-display text-2xl">Norvin García</h3>
          <p className="mt-3 text-sm text-slate-400">Agente de DIAMANTES REALTY GROUP, operando en Nicaragua con asesoría inmobiliaria y acompañamiento integral.</p>
        </div>
        <div className="space-y-3 text-sm text-slate-300">
          <p className="flex items-center gap-2"><Phone size={15}/> +505 8744 6657 </p>
          <p className="flex items-center gap-2"><Mail size={15}/> norvingarcia220@gmail.com</p>
          <p className="flex items-center gap-2"><MapPin size={15}/> Nicaragua</p>
        </div>
        <div className="flex gap-3">
          {social.map(({ icon: Icon, href, label }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="rounded-full bg-slate-800 p-3 transition-colors hover:bg-brand-500" aria-label={label}><Icon size={18} className="text-brand-100" /></a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
