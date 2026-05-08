import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChartNoAxesCombined, CircleCheckBig, FileBadge2, Gavel, Rocket, Sparkles } from 'lucide-react';

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

  const radialStyle = useMemo(
    () => ({
      background: `radial-gradient(520px circle at ${mouse.x}% ${mouse.y}%, rgba(56,189,248,0.2), transparent 45%), radial-gradient(620px circle at ${100 - mouse.x}% ${100 - mouse.y}%, rgba(168,85,247,0.18), transparent 40%)`,
    }),
    [mouse],
  );

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

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-violet-300/20 bg-[linear-gradient(130deg,rgba(15,23,42,0.88),rgba(8,47,73,0.6),rgba(91,33,182,0.45))] p-7 md:p-12">
          <h2 className="text-3xl font-semibold md:text-5xl">Inversión inteligente</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[['+18%', 'ROI medio anual'], ['92', 'Proyectos analizados'], ['4.8/5', 'Índice de confianza']].map(([value, label]) => (
              <motion.div key={label} whileInView={{ scale: [0.95, 1], opacity: [0, 1] }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-2xl border border-white/20 bg-black/25 p-5 backdrop-blur">
                <p className="text-3xl font-semibold text-cyan-200">{value}</p>
                <p className="text-sm text-slate-300">{label}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 h-40 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(56,189,248,0.15),transparent)] p-4">
            <ChartNoAxesCombined className="mb-2 text-cyan-200" />
            <p className="text-sm text-slate-300">Panel de señales: plusvalía, liquidez por zona y riesgo regulatorio con lectura visual tipo plataforma financiera.</p>
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
