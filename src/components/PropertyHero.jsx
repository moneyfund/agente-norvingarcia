import { useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contact } from '../config/brand';
import { normalizePropertyMedia } from '../utils/propertyMedia';
import { applyImageFallback, optimizedPropertyPhoto } from '../utils/propertyPresentation';

const covers = [
  { id: 'FWqr8l37uwxqFhu5RDTW', path: '/pZI92qR.jpeg', image: '/img/esteli-patio.webp', small: '/img/esteli-patio-640.webp' },
  { id: 'rOHVSpbOZzNysCSOWW8A', path: '/Lymvn0E.jpeg', image: '/img/esteli-residencia.webp' },
  { id: 'M1Rpxg12L93Od5PKzZLE', path: '/1uMAAAd.jpeg', image: '/img/matagalpa-residencia.webp' },
];

function getSlides(properties, loading) {
  if (loading) return [covers[0]];
  const slides = covers.flatMap((cover) => {
    const property = properties.find(({ id }) => id === cover.id);
    if (!property) return [];
    const media = normalizePropertyMedia(property);
    return media.some(({ type, url }) => type === 'image' && url.split('?')[0].endsWith(cover.path))
      ? [{ ...cover, property }]
      : [];
  });

  if (slides.length) return slides;

  return properties.flatMap((property) => {
    const photo = normalizePropertyMedia(property).find((item) => item.type === 'image');
    return photo ? [{ id: property.id, image: optimizedPropertyPhoto(photo.url), property }] : [];
  }).slice(0, 3);
}

export default function PropertyHero({ properties, loading }) {
  const [selected, setSelected] = useState(0);
  const slides = getSlides(properties, loading);
  const index = Math.min(selected, Math.max(0, slides.length - 1));
  const slide = slides[index];
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const panX = useSpring(pointerX, { stiffness: 105, damping: 26 });
  const panY = useSpring(pointerY, { stiffness: 105, damping: 26 });
  const { scrollY } = useScroll();
  const depth = useTransform(scrollY, [0, 760], [0, 64]);

  const movePointer = (event) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - left) / width - 0.5) * -18);
    pointerY.set(((event.clientY - top) / height - 0.5) * -12);
  };

  return (
    <section
      className="ng-hero"
      aria-labelledby="home-title"
      onPointerMove={movePointer}
      onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
    >
      <div className="ng-hero-scene" aria-hidden="true">
        <div className="ng-hero-photo-portal">
          <motion.div className="ng-hero-parallax" style={reducedMotion ? undefined : { x: panX, y: panY }}>
            <motion.div className="ng-hero-images" style={reducedMotion ? undefined : { y: depth }}>
              <AnimatePresence initial={false}>
                {slide && <motion.img
                  key={slide.image}
                  src={slide.image}
                  srcSet={slide.small ? `${slide.small} 640w, ${slide.image} 1080w` : undefined}
                  sizes={slide.small ? '(max-width: 700px) 100vw, 72vw' : undefined}
                  alt=""
                  fetchpriority={index === 0 ? 'high' : 'auto'}
                  decoding="async"
                  className="ng-hero-photo"
                  initial={reducedMotion ? false : { clipPath: 'inset(0 0 0 94%)', opacity: 0.4 }}
                  animate={{ clipPath: 'inset(0 0 0 0%)', opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.78, ease: [0.23, 1, 0.32, 1] }}
                  onError={applyImageFallback}
                />}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
        <div className="ng-hero-shadow" />
        <div className="ng-hero-chrome" />
        <div className="ng-hero-rib" />
      </div>
      <div className="ng-wrap ng-hero-content">
        <div className="ng-hero-intro">
          <p className="ng-label ng-hero-eyebrow">Bienes raíces en Nicaragua</p>
          <h1 id="home-title" className="ng-display"><span>Norvin</span> <em>García</em></h1>
          <p className="ng-hero-tagline">Una visión distinta del valor inmobiliario.</p>
          <p className="ng-hero-description">Te acompaño a comprar, vender o invertir en propiedades.</p>
          <div className="ng-hero-actions">
            <Link to="/propiedades" className="ng-button ng-button--metal">Explorar propiedades</Link>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="ng-button ng-button--hero-line"><MessageCircle size={18} aria-hidden="true" /> Conversemos</a>
          </div>
        </div>
        <div className="ng-hero-base">
          <p className="ng-hero-partner"><span>Agente de</span> Diamantes Realty Group</p>
          {slide?.property && (
            <div className="ng-hero-caption">
              <div aria-live="polite">
                <span className="ng-label">En el portafolio</span>
                <Link to={`/propiedad/${slide.id}`} state={{ property: slide.property }}>
                  {slide.property.titulo} <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
              {slides.length > 1 && (
                <div className="ng-hero-controls" role="group" aria-label="Fotografías de portada">
                  <button type="button" className="ng-icon-button" aria-label="Fotografía anterior" onClick={() => setSelected((index - 1 + slides.length) % slides.length)}><ChevronLeft size={20} /></button>
                  <span aria-label={`Fotografía ${index + 1} de ${slides.length}`}>{index + 1}/{slides.length}</span>
                  <button type="button" className="ng-icon-button" aria-label="Fotografía siguiente" onClick={() => setSelected((index + 1) % slides.length)}><ChevronRight size={20} /></button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
