import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import PropertyCard from '../components/PropertyCard';
import Seo from '../components/Seo';
import AnnouncementTicker from '../components/AnnouncementTicker';
import { usePropiedades } from '../hooks/usePropiedades';

const testimonials = [
  { name: 'Laura Méndez', text: 'Norvin vendió mi propiedad en tiempo récord con una estrategia impecable.' },
  { name: 'Carlos Peña', text: 'Experiencia y acompañamiento profesional en cada etapa.' },
];

const heroImages = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2000&q=80', // casa premium
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=2000&q=80', // arquitectura moderna
  'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=2000&q=80', // ciudad moderna
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2000&q=80', // costa/paisaje
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2000&q=80', // propiedad premium
];

function HomePage() {
  const { propiedades, loading } = usePropiedades();
  const featured = useMemo(() => {
    const premiumProperties = propiedades.filter((property) => property.premium);
    return premiumProperties.length ? premiumProperties : propiedades;
  }, [propiedades]);
  const sliderRef = useRef(null);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const preloadImages = heroImages.map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    return () => {
      preloadImages.forEach((image) => {
        image.src = '';
      });
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroImages.length);
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const scrollProperties = (direction) => {
    if (!sliderRef.current) return;

    const scrollAmount = sliderRef.current.clientWidth * 0.85;
    sliderRef.current.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleSliderKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollProperties('next');
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollProperties('prev');
    }
  };

  return (
    <>
      <Seo title="Norvin García | Agente de DIAMANTES REALTY GROUP" description="Agente de DIAMANTES REALTY GROUP operando en Nicaragua con propiedades exclusivas y asesoría premium." />
      <section className="relative isolate overflow-hidden text-white">
        <div className="absolute inset-0 -z-20">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out will-change-transform"
              style={{
                backgroundImage: `url(${image})`,
                opacity: index === heroIndex ? 1 : 0,
                transform: index === heroIndex ? 'scale(1.04)' : 'scale(1)',
                transitionProperty: 'opacity, transform',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden="true" />

        <div className="section-container py-28">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl font-display text-4xl font-bold sm:text-6xl">Norvin García - Agente de DIAMANTES REALTY GROUP</motion.h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-200">Operando en Nicaragua, conectando personas con inversiones extraordinarias en el mercado inmobiliario.</p>
          <span className="mt-5 inline-flex rounded-full border border-brand-100/50 bg-brand-500/20 px-4 py-1 text-sm font-semibold text-brand-50">Asesoría de alto impacto con identidad premium</span>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/propiedades"><Button>Ver Propiedades</Button></Link>
            <a href="https://wa.me/50587446657" target="_blank" rel="noreferrer">
              <Button
                className="!bg-[#25D366] !text-white hover:!bg-[#1ebe5d] transition-all duration-300"
              >
                Contactar por WhatsApp
              </Button>
            </a>
          </div>

          <div className="mt-10 flex items-center gap-2" role="tablist" aria-label="Seleccionar imagen del hero">
            {heroImages.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setHeroIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${index === heroIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white/80'}`}
                aria-label={`Mostrar imagen ${index + 1} del hero`}
                aria-selected={index === heroIndex}
                role="tab"
              />
            ))}
          </div>
        </div>
      </section>

      <AnnouncementTicker />

      <section className="section-container">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold">Propiedades destacadas</h2>
          {featured.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollProperties('prev')}
                className="rounded-full border border-brand-200/70 bg-white p-2 text-slate-700 transition hover:border-brand-500 hover:text-brand-500 dark:border-brand-900/70 dark:bg-slate-900 dark:text-slate-200"
                aria-label="Ver propiedades anteriores"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollProperties('next')}
                className="rounded-full border border-brand-200/70 bg-white p-2 text-slate-700 transition hover:border-brand-500 hover:text-brand-500 dark:border-brand-900/70 dark:bg-slate-900 dark:text-slate-200"
                aria-label="Ver propiedades siguientes"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
        {loading && <p className="mt-4 text-slate-500">Cargando propiedades...</p>}
        <div
          ref={sliderRef}
          className="property-slider mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-3"
          onKeyDown={handleSliderKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Carrusel de propiedades destacadas"
        >
          {featured.map((property) => (
            <div key={property.id} className="w-[85%] shrink-0 snap-start sm:w-[70%] md:w-[48%] lg:w-[32%]">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </section>

      <section className="section-container grid gap-6 md:grid-cols-3">
        {['Atención personalizada', 'Marketing premium', 'Negociación estratégica'].map((item) => (
          <div key={item} className="rounded-2xl border border-brand-100/60 bg-white p-6 shadow-premium dark:border-brand-900/70 dark:bg-slate-900">
            <h3 className="text-xl font-semibold">{item}</h3>
            <p className="mt-2 text-slate-500">Estrategias enfocadas en maximizar el valor de tu inversión inmobiliaria.</p>
          </div>
        ))}
      </section>

      <section className="section-container">
        <h2 className="font-display text-3xl font-semibold">Testimonios</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="rounded-2xl border border-brand-100/70 bg-white p-6 shadow-premium dark:border-brand-900/70 dark:bg-slate-900">
              <Star className="text-brand-500" fill="currentColor" />
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
