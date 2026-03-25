import { Facebook, Instagram, MessageCircle, Music2 } from 'lucide-react';
import Seo from '../components/Seo';

function AboutPage() {
  return (
    <section className="section-container">
      <Seo title="Sobre mí | Norvin García" description="Conoce la trayectoria de Norvin García, asesor inmobiliario especializado en propiedades premium." />
      <div className="grid items-center gap-10 md:grid-cols-2">
        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1000&q=80" alt="Norvin García" className="w-full rounded-2xl shadow-premium" />
        <div>
          <h1 className="font-display text-4xl font-semibold">Norvin García</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Soy asesor inmobiliario con más de 10 años de experiencia en compraventa de propiedades residenciales, comerciales y de inversión. Mi enfoque combina análisis de mercado, estrategias de negociación y una atención impecable.</p>
          <div className="mt-6 space-y-2">
            <p><strong>Experiencia:</strong> 10+ años en bienes raíces.</p>
            <p><strong>Especialización:</strong> Mercado premium y captación de propiedades de alto valor.</p>
          </div>
          <div className="mt-6 flex gap-3">
            {[MessageCircle, Facebook, Instagram, Music2].map((Icon, idx) => <button key={idx} className="rounded-full bg-slate-100 p-3 dark:bg-slate-800"><Icon size={18} /></button>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;
