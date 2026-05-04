import {
  BadgeCheck,
  Facebook,
  Handshake,
  House,
  Instagram,
  MapPinHouse,
  MessageCircle,
  Music2,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { getAgente } from '../services/agentesService';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0 },
};

const slideRight = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0 },
};

const valueProps = [
  {
    icon: Rocket,
    title: 'Venta más rápida',
    description: 'Diseño estrategias de posicionamiento, difusión y negociación para reducir tiempos y maximizar resultados.',
  },
  {
    icon: ShieldCheck,
    title: 'Propiedades verificadas',
    description: 'Trabajo con información clara y validación documental para proteger cada operación desde el primer contacto.',
  },
  {
    icon: Handshake,
    title: 'Asesoría personalizada',
    description: 'Cada cliente recibe un plan adaptado a su objetivo: vender, comprar o invertir con seguridad y enfoque.',
  },
  {
    icon: MapPinHouse,
    title: 'Enfoque en Nicaragua',
    description: 'Conozco el mercado local, las zonas de mayor oportunidad y cómo conectar tu propiedad con el comprador ideal.',
  },
];

const trustStats = [
  { value: '+30', label: 'propiedades gestionadas' },
  { value: '+30', label: 'clientes satisfechos' },
  { value: '+6', label: 'departamentos cubiertos' },
];

function AboutPage() {
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    getAgente().then(setAgent).catch(() => setAgent(null));
  }, []);

  return (
    <section className="section-container space-y-12 md:space-y-16">
      <Seo title="Sobre mí | Norvin García" description="Agente de DIAMANTES REALTY GROUP operando en Nicaragua, especializado en propiedades premium." />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        variants={fadeUp}
        className="overflow-hidden rounded-3xl border border-brand-100/70 bg-gradient-to-br from-white via-rose-50 to-brand-100/40 p-6 shadow-premium dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-brand-950/30 sm:p-10"
      >
        <div className="grid items-center gap-8 md:grid-cols-[1fr_1.2fr]">
          <motion.div variants={slideLeft} transition={{ duration: 0.8 }}>
            <div className="group relative overflow-hidden rounded-3xl shadow-premium">
              <img
                src={agent?.foto || 'https://i.imgur.com/Ns7IISf.jpeg'}
                alt="Norvin García, asesor inmobiliario"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
          </motion.div>

          <motion.div variants={slideRight} transition={{ duration: 0.8 }} className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-200">
              <BadgeCheck size={14} />
              Perfil profesional
            </span>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">Norvin García</h1>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200">Asesor Inmobiliario | DIAMANTES REALTY GROUP</p>
            <p className="text-base text-brand-700 dark:text-brand-200">Especialista en propiedades en Nicaragua</p>
            <p className="text-slate-600 dark:text-slate-300">
              {agent?.biografia
                || 'Acompaño a propietarios e inversionistas a tomar decisiones inmobiliarias inteligentes con estrategia comercial, transparencia y resultados medibles.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a href={agent?.whatsapp || '#'} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 p-3 transition hover:-translate-y-0.5 hover:bg-brand-500/10 dark:bg-slate-800">
                <MessageCircle size={18} />
              </a>
              <a href={agent?.facebook || '#'} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 p-3 transition hover:-translate-y-0.5 hover:bg-brand-500/10 dark:bg-slate-800">
                <Facebook size={18} />
              </a>
              <a href={agent?.instagram || '#'} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 p-3 transition hover:-translate-y-0.5 hover:bg-brand-500/10 dark:bg-slate-800">
                <Instagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@agentenorvingarcia" target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 p-3 transition hover:-translate-y-0.5 hover:bg-brand-500/10 dark:bg-slate-800">
                <Music2 size={18} />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.article
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        transition={{ staggerChildren: 0.18 }}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-premium dark:border-slate-700 dark:bg-slate-900 sm:p-10"
      >
        <motion.h2 variants={fadeUp} className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-100">Mi historia en bienes raíces</motion.h2>
        <motion.p variants={fadeUp} className="mt-4 text-slate-600 dark:text-slate-300">
          Comencé en el sector inmobiliario al ver cómo una buena asesoría puede cambiar por completo el resultado de una familia que vende su hogar o de un comprador que busca invertir con seguridad. Desde entonces, decidí dedicarme a construir procesos claros, humanos y efectivos para cada cliente.
        </motion.p>
        <motion.p variants={fadeUp} className="mt-4 text-slate-600 dark:text-slate-300">
          Mi enfoque combina conocimiento de mercado, comunicación constante y negociación estratégica. No trabajo con soluciones genéricas: escucho tus objetivos, evalúo el contexto de tu propiedad y diseño un plan realista para lograr una venta sólida o una compra inteligente.
        </motion.p>
        <motion.p variants={fadeUp} className="mt-4 text-slate-600 dark:text-slate-300">
          Lo que me diferencia es el compromiso total con el resultado: transparencia en cada paso, acompañamiento cercano y visión comercial enfocada en oportunidades reales dentro de Nicaragua.
        </motion.p>
      </motion.article>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 variants={fadeUp} className="font-display text-3xl font-semibold">Propuesta de valor</motion.h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {valueProps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                variants={fadeUp}
                transition={{ delay: index * 0.06 }}
                className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-premium transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="mb-4 inline-flex rounded-2xl bg-brand-500/10 p-3 text-brand-600 dark:text-brand-300">
                  <Icon size={20} />
                </span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              </motion.article>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.15 }}
        className="grid gap-5 rounded-3xl border border-brand-100 bg-brand-600/95 p-6 text-white shadow-premium sm:grid-cols-3 sm:p-8"
      >
        {trustStats.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp} className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-sm text-brand-100">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.blockquote
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        transition={{ duration: 0.7 }}
        className="relative rounded-3xl border border-slate-200/80 bg-white p-8 shadow-premium dark:border-slate-700 dark:bg-slate-900 sm:p-10"
      >
        <span className="absolute left-6 top-3 text-6xl font-display text-brand-300/70">“</span>
        <p className="pl-6 text-lg italic text-slate-700 dark:text-slate-200">
          Gracias a Norvin logramos vender nuestra propiedad mucho más rápido de lo esperado. Su asesoría y dedicación hicieron toda la diferencia.
        </p>
        <footer className="mt-4 pl-6 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">— Cliente satisfecho</footer>
      </motion.blockquote>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1800&q=80"
          alt="Propiedad premium en Nicaragua"
          className="h-[280px] w-full object-cover transition duration-700 hover:scale-105 sm:h-[340px]"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <p className="max-w-2xl font-display text-3xl leading-tight text-white sm:text-4xl">
            Más que vender propiedades, construyo confianza y oportunidades.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeUp}
        className="flex flex-col justify-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-premium dark:border-slate-700 dark:bg-slate-900 sm:flex-row"
      >
        <a
          href={agent?.whatsapp || '#'}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
        >
          <MessageCircle size={18} />
          Contactar por WhatsApp
        </a>
        <Link
          to="/propiedades"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-500 px-6 py-3 font-semibold text-brand-600 transition hover:bg-brand-500/10 dark:text-brand-300"
        >
          <House size={18} />
          Ver propiedades
        </Link>
      </motion.div>
    </section>
  );
}

export default AboutPage;
