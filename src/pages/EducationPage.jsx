import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CircleCheckBig, Compass, FileBadge2, FileText, Gavel, Layers3, Map, Rocket, SearchCheck, Sparkles, TrendingUp } from 'lucide-react';

const reveal = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const particles = Array.from({ length: 26 }).map((_, i) => ({
  id: i,
  size: 2 + (i % 5) * 1.4,
  x: (i * 13) % 100,
  y: (i * 7) % 100,
  duration: 12 + (i % 6) * 4,
}));

function EducationPage() {
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const adviceSliderRef = useRef(null);

  const adviceCards = [
    { title: 'Verificación legal completa', description: 'Confirma historial registral, gravámenes y legitimidad del propietario antes de entregar cualquier anticipo.', icon: SearchCheck },
    { title: 'Evita errores al comprar terrenos', description: 'Valida topografía, uso de suelo, accesos y situación municipal para prevenir costos ocultos.', icon: Compass },
    { title: 'Eleva el valor antes de vender', description: 'Aplica mejoras estratégicas de fachada, distribución e iluminación para aumentar percepción y precio.', icon: TrendingUp },
    { title: 'Checklist antes de la compraventa', description: 'Revisa cláusulas, tiempos de entrega, penalizaciones y soporte legal previo a la firma definitiva.', icon: FileText },
    { title: 'Acceso y servicios básicos', description: 'Evalúa agua, energía, drenaje, conectividad y vías de ingreso como factores críticos de plusvalía.', icon: Map },
    { title: 'Detecta oportunidades reales', description: 'Cruza ubicación, crecimiento comercial y demanda para identificar propiedades con potencial sostenido.', icon: Layers3 },
    { title: 'Posesión vs escritura', description: 'Diferencia tenencia informal de titularidad legal para proteger tu inversión a largo plazo.', icon: BookOpen },
    { title: 'Invertir en zonas en expansión', description: 'Prioriza corredores con infraestructura proyectada y dinámica económica activa en Nicaragua.', icon: CircleCheckBig },
  ];

  const radialStyle = useMemo(
    () => ({
      background: `radial-gradient(520px circle at ${mouse.x}% ${mouse.y}%, rgba(56,189,248,0.2), transparent 45%), radial-gradient(620px circle at ${100 - mouse.x}% ${100 - mouse.y}%, rgba(168,85,247,0.18), transparent 40%)`,
    }),
    [mouse],
  );

  const handleAdviceWheel = (event) => {
    if (!adviceSliderRef.current) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    adviceSliderRef.current.scrollBy({ left: event.deltaY, behavior: 'smooth' });
  };

  return (
    <div
      className="relative overflow-hidden bg-[#04050b] text-slate-100"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouse({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 transition-all duration-300" style={radialStyle} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.24),transparent_35%),radial-gradient(circle_at_70%_30%,rgba(192,38,211,0.2),transparent_30%)]" />
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none absolute z-0 rounded-full bg-cyan-300/70 blur-[1px]"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -24, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{ repeat: Infinity, duration: p.duration, ease: 'easeInOut' }}
        />
      ))}

      <section className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-2xl md:p-12">
          <motion.p custom={1} variants={reveal} className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-200">
            <Sparkles size={14} /> Ecosistema Educación Inmobiliaria
          </motion.p>
          <motion.h1 custom={2} variants={reveal} className="max-w-4xl text-4xl font-semibold leading-tight md:text-7xl">
            Aprende el mundo inmobiliario de forma inteligente
          </motion.h1>
          <motion.p custom={3} variants={reveal} className="mt-6 max-w-2xl text-base text-slate-300 md:text-xl">
            Un laboratorio interactivo con guías visuales, estrategia legal, señales de mercado y marcos de inversión para decidir con precisión.
          </motion.p>
          <motion.div custom={4} variants={reveal} className="mt-10 flex flex-wrap items-center gap-4">
            <button className="group rounded-2xl border border-cyan-200/40 bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-200/70 hover:shadow-[0_0_40px_rgba(34,211,238,0.25)]">
              Iniciar experiencia
              <ArrowRight size={15} className="ml-2 inline transition group-hover:translate-x-1" />
            </button>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Scroll para explorar módulos</p>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="mb-8 text-3xl font-semibold md:text-5xl">Antes de comprar</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Documentos esenciales', FileBadge2, 'Título de propiedad, solvencias, historial registral y validación catastral.'],
            ['Verificación técnica', CircleCheckBig, 'Checklist estructural, entorno, servicios y estado de mantenimiento real.'],
            ['Errores comunes', Gavel, 'Sobreprecio, omitir inspección legal y no medir costo financiero total.'],
            ['Revisión legal', BookOpen, 'Gravámenes, litigios activos, servidumbres y trazabilidad del dueño.'],
          ].map(([title, Icon, desc], i) => (
            <motion.article key={title} custom={i + 1} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={reveal} className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_25px_65px_rgba(59,130,246,0.16)]">
              <Icon className="mb-4 text-cyan-300" />
              <h3 className="mb-2 text-xl font-medium">{title}</h3>
              <p className="text-sm text-slate-300">{desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="mb-10 text-3xl font-semibold md:text-5xl">Antes de vender</h2>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-2xl md:p-10">
          {[
            ['01', 'Maximizar valor', 'Renovaciones tácticas, home staging y benchmarking de competencia directa.'],
            ['02', 'Fotografía profesional', 'Storytelling visual, tomas aéreas y video corto vertical para campañas.'],
            ['03', 'Estrategia comercial', 'Precio ancla, ventanas de negociación y posicionamiento por segmentos.'],
            ['04', 'Publicidad digital', 'Distribución multicanal, audiencias lookalike y remarketing inmobiliario.'],
          ].map(([n, t, d]) => (
            <motion.div key={n} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <span className="rounded-xl border border-cyan-300/40 bg-cyan-300/15 px-3 py-2 text-xs tracking-[0.2em] text-cyan-100">{n}</span>
              <div>
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-slate-300">{d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_80%_35%,rgba(147,51,234,0.22),transparent_35%),linear-gradient(160deg,rgba(2,6,23,0.92),rgba(15,23,42,0.88))] p-8 shadow-[0_40px_120px_rgba(8,47,73,0.45)] backdrop-blur-3xl md:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]">
              <div className="h-full w-full bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
            </div>
            <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.9 }} className="relative z-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-4 py-1 text-xs uppercase tracking-[0.24em] text-cyan-100">
                <Sparkles size={13} /> Experiencia Premium
              </p>
              <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-6xl">Consejos Inmobiliarios Profesionales en Nicaragua</h2>
              <p className="mt-5 max-w-3xl text-sm text-slate-300 md:text-lg">
                Desliza horizontalmente para explorar recomendaciones estratégicas con enfoque legal, comercial y de plusvalía real.
              </p>
            </motion.div>

            <div
              ref={adviceSliderRef}
              onWheel={handleAdviceWheel}
              className="advice-slider relative z-10 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {adviceCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.article
                    key={card.title}
                    initial={{ opacity: 0, y: 46, filter: 'blur(10px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.85, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -10, scale: 1.015 }}
                    className="group relative min-h-[22rem] w-[89%] shrink-0 snap-center overflow-hidden rounded-[1.8rem] border border-white/15 bg-[linear-gradient(150deg,rgba(15,23,42,0.7),rgba(30,41,59,0.45),rgba(15,23,42,0.75))] p-7 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-2xl sm:w-[68%] lg:w-[44%] xl:w-[36%]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(300px_circle_at_10%_5%,rgba(56,189,248,0.18),transparent_48%),radial-gradient(280px_circle_at_90%_90%,rgba(147,51,234,0.2),transparent_50%)] opacity-80 transition duration-500 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-[1px] rounded-[1.7rem] border border-white/20" />
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 6 + (index % 3), ease: 'easeInOut' }} className="relative">
                      <span className="inline-flex rounded-2xl border border-cyan-200/40 bg-cyan-400/15 p-3 text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.35)]">
                        <Icon size={22} />
                      </span>
                    </motion.div>
                    <h3 className="relative mt-7 text-2xl font-semibold leading-tight text-white md:text-3xl">{card.title}</h3>
                    <p className="relative mt-4 text-sm leading-relaxed text-slate-200 md:text-base">{card.description}</p>
                    <div className="pointer-events-none absolute bottom-5 left-7 right-7 h-16 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.22),transparent_65%)] opacity-60 blur-2xl transition group-hover:opacity-100" />
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-[2rem] border border-cyan-200/20 bg-gradient-to-r from-cyan-400/15 via-violet-500/20 to-sky-500/15 p-10 text-center backdrop-blur-2xl md:p-16">
          <Rocket className="mx-auto mb-6 text-cyan-200" />
          <h2 className="text-3xl font-semibold md:text-6xl">La información correcta cambia decisiones</h2>
          <motion.a
            href="https://wa.me/TUNUMERO?text=Hola,%20quiero%20asesoramiento%20profesional."
            target="_blank"
            rel="noreferrer"
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="group relative mt-8 inline-flex overflow-hidden rounded-2xl border border-cyan-200/45 bg-black/20 px-7 py-3.5 text-sm font-semibold text-cyan-50 backdrop-blur-2xl transition-all duration-500 hover:border-cyan-100/80 hover:shadow-[0_0_25px_rgba(34,211,238,0.35),0_0_65px_rgba(147,51,234,0.25)]"
            style={{
              backgroundImage: `radial-gradient(180px circle at ${mouse.x}% ${mouse.y}%, rgba(56,189,248,0.34), transparent 55%), linear-gradient(130deg, rgba(8,47,73,0.65), rgba(76,29,149,0.55), rgba(15,23,42,0.7))`,
            }}
          >
            <span className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 blur-[1px] transition-all duration-700 group-hover:left-[115%] group-hover:opacity-100" />
            <span className="pointer-events-none absolute inset-[1px] rounded-2xl border border-white/15" />
            <span className="relative inline-flex items-center gap-2 tracking-[0.02em]">
              Contáctame para asesoría profesional
              <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1.5" />
            </span>
          </motion.a>
        </motion.div>
      </section>
    </div>
  );
}

export default EducationPage;
