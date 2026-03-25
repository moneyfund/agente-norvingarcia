import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Music2 } from 'lucide-react';

const social = [
  { icon: MessageCircle, href: 'https://wa.me/50587446657', label: 'WhatsApp' },
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=100092228811002', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/norgarciabr?igsh=cWZobXN6eWtuaWJq', label: 'Instagram' },
  { icon: Music2, href: 'https://www.tiktok.com/@norvin.garca.br?_r=1&_t=ZS-94ydmdWwrxd', label: 'TikTok' },
];

function Footer() {
  const logoSrc = '/LOGO DIAMANTES.png';

  return (
    <footer className="mt-16 bg-slate-900 text-slate-200">
      <div className="section-container grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-visible rounded-full border border-slate-600 bg-white p-1 shadow-sm">
            <img src={logoSrc} alt="Logo DIAMANTES REALTY GROUP" className="block h-9 w-9 min-h-9 min-w-9 shrink-0 object-contain opacity-100" />
          </div>
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
