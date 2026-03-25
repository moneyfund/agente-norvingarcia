import { Facebook, Instagram, MessageCircle, Music2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Seo from '../components/Seo';
import { getAgente } from '../services/agentesService';

function AboutPage() {
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    getAgente().then(setAgent).catch(() => setAgent(null));
  }, []);

  return (
    <section className="section-container">
      <Seo title="Sobre mí | Norvin García" description="Agente de DIAMANTES REALTY GROUP operando en Nicaragua, especializado en propiedades premium." />
      <div className="grid items-center gap-10 md:grid-cols-2">
        <img src={agent?.foto || 'https://i.imgur.com/Ns7IISf.jpeg'} alt="Norvin García" className="w-full rounded-2xl shadow-premium" />
        <div>
          <h1 className="font-display text-4xl font-semibold">{agent?.nombre || 'Norvin García'}</h1>
          <p className="mt-2 inline-block rounded-full bg-brand-500/10 px-3 py-1 text-sm font-semibold text-brand-600 dark:text-brand-100">Agente de DIAMANTES REALTY GROUP · Operando en Nicaragua</p>
          <p className="mt-4 text-slate-600 dark:text-slate-300">{agent?.biografia || 'Soy un profesional del mercado inmobiliario enfocado en brindar soluciones reales y oportunidades de valor a cada cliente. Me especializo en la compra, venta y asesoría de propiedades, combinando conocimiento del mercado, estrategia comercial y atención personalizada para lograr resultados efectivos.'}</p>
          <div className="mt-6 space-y-2">
            <p><strong>Especialización:</strong> Mercado nicaraguense y captación de propiedades de alto valor.</p>
          </div>
          <div className="mt-6 flex gap-3">
            <a href={agent?.whatsapp || '#'} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 p-3 dark:bg-slate-800"><MessageCircle size={18} /></a>
            <a href={agent?.facebook || '#'} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 p-3 dark:bg-slate-800"><Facebook size={18} /></a>
            <a href={agent?.instagram || '#'} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 p-3 dark:bg-slate-800"><Instagram size={18} /></a>
            <a href={agent?.tiktok || '#'} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 p-3 dark:bg-slate-800"><Music2 size={18} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;
