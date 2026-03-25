import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Button from '../components/Button';
import PropertyCard from '../components/PropertyCard';
import Seo from '../components/Seo';
import { usePropiedades } from '../hooks/usePropiedades';

const testimonials = [
  { name: 'Laura Méndez', text: 'Norvin vendió mi propiedad en tiempo récord con una estrategia impecable.' },
  { name: 'Carlos Peña', text: 'Experiencia premium y acompañamiento profesional en cada etapa.' },
];

function HomePage() {
  const { propiedades, loading } = usePropiedades();
  const featured = propiedades.filter((property) => property.premium).slice(0, 3);

  return (
    <>
      <Seo title="Norvin García | Asesor Inmobiliario" description="Portal inmobiliario premium con propiedades exclusivas y asesoría de alto nivel." />
      <section className="bg-hero bg-cover bg-center text-white">
        <div className="section-container py-28">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl font-display text-4xl font-bold sm:text-6xl">Norvin García - Asesor Inmobiliario</motion.h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-200">Conectando personas con inversiones extraordinarias en el mercado inmobiliario premium.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/propiedades"><Button>Ver Propiedades</Button></Link>
            <a href="https://wa.me/18095551234" target="_blank" rel="noreferrer"><Button variant="secondary">Contactar por WhatsApp</Button></a>
          </div>
        </div>
      </section>

      <section className="section-container">
        <h2 className="font-display text-3xl font-semibold">Propiedades destacadas</h2>
        {loading && <p className="mt-4 text-slate-500">Cargando propiedades...</p>}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
      </section>

      <section className="section-container grid gap-6 md:grid-cols-3">
        {['Atención personalizada', 'Marketing premium', 'Negociación estratégica'].map((item) => (
          <div key={item} className="rounded-2xl bg-white p-6 shadow-premium dark:bg-slate-900">
            <h3 className="text-xl font-semibold">{item}</h3>
            <p className="mt-2 text-slate-500">Estrategias enfocadas en maximizar el valor de tu inversión inmobiliaria.</p>
          </div>
        ))}
      </section>

      <section className="section-container">
        <h2 className="font-display text-3xl font-semibold">Testimonios</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="rounded-2xl bg-white p-6 shadow-premium dark:bg-slate-900">
              <Star className="text-amber-400" fill="currentColor" />
              <p className="mt-4 text-slate-600 dark:text-slate-300">“{testimonial.text}”</p>
              <p className="mt-3 font-semibold">{testimonial.name}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;
