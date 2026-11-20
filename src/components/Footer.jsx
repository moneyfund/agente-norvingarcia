import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Music2 } from 'lucide-react';

const social = [
  { icon: MessageCircle, href: 'https://wa.me/50587446657', label: 'WhatsApp' },
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=100092228811002', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/norgarciabr?igsh=cWZobXN6eWtuaWJq', label: 'Instagram' },
  { icon: Music2, href: 'https://www.tiktok.com/@agentenorvingarcia', label: 'TikTok' },
];

function Footer() {
  return (
    <footer className="ng-footer mt-16 text-slate-200">
      <div className="section-container grid gap-10 md:grid-cols-3">
        <div>
          <div className="ng-brand"><span className="ng-monogram">NG</span><span className="ng-wordmark">NORVIN GARCÍA<small>REAL ESTATE / NICARAGUA</small></span></div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-300">Asesoría inmobiliaria para decisiones con visión de futuro.</p>
        </div>

        <div className="space-y-3 text-sm text-slate-300">
          <p className="flex items-center gap-2"><Phone size={15} /> +505 8744 6657</p>
          <p className="flex items-center gap-2"><Mail size={15} /> agentenorvingarcia@gmail.com</p>
          <p className="flex items-center gap-2"><MapPin size={15} /> Nicaragua</p>
        </div>

        <div className="flex gap-3">
          {social.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-slate-800 p-3 transition-colors hover:bg-brand-500"
              aria-label={label}
            >
              <Icon size={18} className="text-brand-100" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
