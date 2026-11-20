import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, Handshake, MapPinned, ShieldCheck, Star, Timer } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import PropertyCard from '../components/PropertyCard';
import Seo from '../components/Seo';
import AnnouncementTicker from '../components/AnnouncementTicker';
import { usePropiedades } from '../hooks/usePropiedades';
import { isLandOrFarmProperty } from '../utils/propertyTypeFilters';

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

const agentBenefits = [
  {
    icon: Timer,
    title: 'Vendemos más rápido',
    description: 'Activamos estrategias de comercialización premium para conectar tu propiedad con compradores calificados en menor tiempo.',
  },
  {
    icon: ShieldCheck,
    title: 'Propiedades reales y seguras',
    description: 'Validamos información y documentación para que cada proceso sea confiable, transparente y sin sorpresas.',
  },
  {
    icon: MapPinned,
    title: 'Especialistas en Nicaragua',
    description: 'Conocemos el mercado local zona por zona para recomendar oportunidades con verdadero potencial de plusvalía.',
  },
  {
    icon: Handshake,
    title: 'Asesoría completa',
    description: 'Te acompañamos desde la estrategia inicial hasta el cierre con negociación experta y atención personalizada.',
  },
];

function HomePage() {
  const { propiedades, loading } = usePropiedades();
  const reduceMotion = useReducedMotion();
  const featured = useMemo(() => {
    const premiumProperties = propiedades.filter((property) => property.premium);
    return premiumProperties.length ? premiumProperties : propiedades;
  }, [propiedades]);
  const sliderRef = useRef(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const landSliderRef = useRef(null);

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
    if (reduceMotion) return;
    const intervalId = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroImages.length);
    }, 6500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [reduceMotion]);

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

  const landProperties = useMemo(() => propiedades.filter((property) => isLandOrFarmProperty(property)), [propiedades]);
  const featuredLandProperties = useMemo(() => {
    const premiumLand = landProperties.filter((property) => property.premium);
    const prioritized = premiumLand.length ? [...premiumLand, ...landProperties.filter((property) => !property.premium)] : landProperties;
    return prioritized.slice(0, 6);
  }, [landProperties]);
  const hasMoreLandProperties = landProperties.length > featuredLandProperties.length;

  const handleLandSliderKeyDown = (event) => {
    if (!landSliderRef.current) return;

    const scrollAmount = landSliderRef.current.clientWidth * 0.85;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      landSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      landSliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Seo title="Norvin García | Agente de DIAMANTES REALTY GROUP" description="Agente de DIAMANTES REALTY GROUP operando en Nicaragua con propiedades exclusivas y asesoría premium." />
      <section className="ng-hero" aria-label="Presentación de Norvin García">
        <div className="ng-hero-inner">
          <div className="ng-hero-copy">
            <div className="ng-kicker"><i /> Nicaragua / Bienes raíces</div>
            <motion.h1 initial={reduceMotion ? false : {opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.7}}>Norvin<br/>García<span>.</span></motion.h1>
            <p className="ng-hero-tag">Una visión distinta<br/>del valor inmobiliario.</p>
            <p className="ng-hero-description">Encuentra oportunidades para vivir, invertir y construir patrimonio en Nicaragua, con asesoría inmobiliaria personalizada.</p>
            <div className="ng-hero-actions">
              <Link className="ng-action ng-action-primary" to="/propiedades">Explorar propiedades <ArrowUpRight size={19}/></Link>
              <a className="ng-action ng-action-outline" href="https://wa.me/50587446657" target="_blank" rel="noreferrer">Conversemos <ArrowUpRight size={16}/></a>
            </div>
            <div className="ng-hero-credential"><span>Agente inmobiliario</span><span>Diamantes Realty Group</span></div>
          </div>
          <div className="ng-hero-visual">
            <div className="ng-hero-frame">
              {heroImages.map((image,index)=><div className={'ng-hero-photo'+(index===heroIndex?' is-current':'')} key={image} style={{backgroundImage:`url(${image})`}} aria-hidden="true"/>)}
              <div className="ng-hero-photo-shade"/>
              <span className="ng-hero-frame-label">NG / REAL ESTATE</span>
              <div className="ng-hero-frame-bottom"><span>Perspectivas inmobiliarias</span><strong>0{heroIndex+1}<small> / 0{heroImages.length}</small></strong></div>
            </div>
            <div className="ng-hero-controls" aria-label="Seleccionar imagen">
              <button type="button" aria-label="Imagen anterior" onClick={()=>setHeroIndex(i=>(i+heroImages.length-1)%heroImages.length)}><ChevronLeft size={18}/></button>
              <div className="ng-hero-dots">{heroImages.map((image,index)=><button key={image} type="button" className={index===heroIndex?'is-current':''} aria-label={`Imagen ${index+1}`} aria-pressed={index===heroIndex} onClick={()=>setHeroIndex(index)}/>)}</div>
              <button type="button" aria-label="Imagen siguiente" onClick={()=>setHeroIndex(i=>(i+1)%heroImages.length)}><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
        <div className="ng-hero-index"><span>01 / IDENTIDAD</span><span>ESTRATEGIA · PATRIMONIO · CONFIANZA</span></div>
      </section>

      <AnnouncementTicker />

      <section className="section-container ng-collection">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="ng-kicker"><i/> 02 / Portafolio</p><h2 className="font-display text-3xl font-semibold">Propiedades destacadas</h2><p className="mt-3 text-slate-500">Oportunidades seleccionadas para tu próxima decisión.</p></div>
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
        <Link to="/propiedades" className="ng-text-link">Explorar todo el portafolio <ArrowUpRight size={18}/></Link>
      </section>

      {featuredLandProperties.length > 0 && (
        <section className="section-container pt-0">
          <div className="terrenos-fincas-highlight rounded-[2rem] border border-brand-300/40 p-6 shadow-premium dark:border-brand-900/70 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full border border-white/50 bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  Categoría especial
                </span>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white md:text-4xl">TERRENOS Y FINCAS DESTACADAS</h2>
                <p className="mt-3 max-w-3xl text-white/90">
                  Descubre oportunidades ideales para invertir, construir o desarrollar en ubicaciones estratégicas.
                </p>
              </div>
              {featuredLandProperties.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!landSliderRef.current) return;
                      const scrollAmount = landSliderRef.current.clientWidth * 0.85;
                      landSliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                    }}
                    className="rounded-full border border-brand-200 bg-white/95 p-2 text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-brand-900 dark:bg-slate-900 dark:text-slate-200"
                    aria-label="Ver terrenos anteriores"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!landSliderRef.current) return;
                      const scrollAmount = landSliderRef.current.clientWidth * 0.85;
                      landSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    }}
                    className="rounded-full border border-brand-200 bg-white/95 p-2 text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-brand-900 dark:bg-slate-900 dark:text-slate-200"
                    aria-label="Ver terrenos siguientes"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={landSliderRef}
              className="property-slider mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-3"
              onKeyDown={handleLandSliderKeyDown}
              tabIndex={0}
              role="region"
              aria-label="Carrusel de terrenos y fincas destacadas"
            >
              {featuredLandProperties.map((property) => (
                <div key={property.id} className="w-[85%] shrink-0 snap-start sm:w-[70%] md:w-[48%] lg:w-[32%]">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-200">
                      {property.tipo}
                    </span>
                    <span className="inline-flex rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-200">
                      Oportunidad
                    </span>
                  </div>
                  <PropertyCard property={property} ctaLabel="Ver detalle" />
                </div>
              ))}
            </div>

            {hasMoreLandProperties && (
              <div className="mt-8 flex justify-center">
                <Link to="/propiedades?categoria=terrenos-fincas">
                  <Button className="inline-flex items-center gap-2">
                    Ver más terrenos y fincas
                    <ArrowUpRight size={18} />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section-container grid gap-6 md:grid-cols-3">
        <div className="md:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Vende o encuentra tu propiedad con expertos en Nicaragua</h2>
            <p className="mt-4 text-base text-slate-500 md:text-lg dark:text-slate-300">
              En DIAMANTES REALTY GROUP aceleramos el proceso con estrategia, visibilidad y acompañamiento profesional.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 md:col-span-3 md:grid-cols-2 xl:grid-cols-4">
          {agentBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.article
                key={benefit.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="group rounded-3xl border border-brand-100/70 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/80 dark:border-brand-900/70 dark:bg-slate-900"
              >
                <span className="inline-flex rounded-2xl bg-brand-500/10 p-3 text-brand-500 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-300">{benefit.description}</p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="relative isolate overflow-hidden rounded-3xl md:col-span-3"
        >
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80')",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 -z-10 bg-slate-950/70" aria-hidden="true" />
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center text-white md:min-h-[360px]">
            <p className="max-w-3xl font-display text-3xl font-semibold leading-tight md:text-5xl">
              No solo mostramos propiedades… creamos oportunidades.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/propiedades">
                <Button className="inline-flex items-center gap-2">
                  Ver propiedades
                  <ArrowUpRight size={18} />
                </Button>
              </Link>
              <a href="https://wa.me/50587446657" target="_blank" rel="noreferrer">
                <Button
                  variant="secondary"
                  className="ng-action-outline"
                >
                  Contactar por WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
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
