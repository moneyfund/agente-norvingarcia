import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle2, LoaderCircle, Sparkles, Wand2 } from 'lucide-react';
import Seo from '../components/Seo';
import Button from '../components/Button';
import { usePropiedades } from '../hooks/usePropiedades';
import { getPrimaryImageUrl } from '../utils/propertyMedia';

const quickTools = [
  'Cambiar color',
  'Remodelar fachada',
  'Estilo moderno',
  'Estilo minimalista',
  'Estilo lujo',
  'Agregar jardín',
  'Agregar piscina',
  'Amoblar interior',
  'Construir sobre terreno',
  'Mejorar exteriores',
];

const styleOptions = ['Moderno', 'Colonial', 'Minimalista', 'Premium', 'Tropical', 'Contemporáneo'];
const changeLevels = ['Cambio ligero', 'Remodelación media', 'Transformación completa'];
const visualizationTypes = [
  'Antes / Después',
  'Propuesta conceptual',
  'Remodelación exterior',
  'Remodelación interior',
  'Desarrollo sobre terreno',
];

const currency = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function AIPropertyDesignPage() {
  const { propiedades, loading, error } = usePropiedades();
  const editableProperties = useMemo(
    () => propiedades.filter((property) => property.editableConIA),
    [propiedades],
  );

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(styleOptions[0]);
  const [changeLevel, setChangeLevel] = useState(changeLevels[1]);
  const [visualizationType, setVisualizationType] = useState(visualizationTypes[1]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    setResult(null);
    setIsGenerating(false);
  };

  const toggleTool = (tool) => {
    setSelectedTools((prev) => {
      if (prev.includes(tool)) {
        return prev.filter((item) => item !== tool);
      }

      const nextTools = [...prev, tool];
      const autoPrompt = `Quiero ${nextTools.join(', ').toLowerCase()} manteniendo la esencia de la propiedad.`;
      setDescription((prevDescription) => (prevDescription.trim() ? prevDescription : autoPrompt));
      return nextTools;
    });
  };

  const handleGenerate = () => {
    if (!selectedProperty || !description.trim()) return;

    setIsGenerating(true);
    setResult(null);

    window.setTimeout(() => {
      setResult({
        summary: description.trim(),
        style: selectedStyle,
        level: changeLevel,
        visualizationType,
        tools: selectedTools,
        date: new Date().toLocaleString('es-DO', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <section className="section-container space-y-10">
      <Seo
        title="Diseño de propiedades con IA | Norvin García"
        description="Prototipo visual premium para conceptualizar remodelaciones, mejoras y desarrollo de propiedades habilitadas para edición visual con IA."
      />

      <div className="overflow-hidden rounded-3xl border border-brand-100/70 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 p-8 text-white shadow-[0_26px_60px_rgba(190,18,60,0.35)]">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          <Sparkles size={14} /> Herramienta exclusiva
        </p>
        <h1 className="mt-5 font-display text-3xl font-semibold sm:text-5xl">DISEÑO DE PROPIEDADES CON IA</h1>
        <p className="mt-4 max-w-3xl text-base text-brand-50 sm:text-lg">
          Visualiza remodelaciones, mejoras y nuevas ideas antes de tomar una decisión.
        </p>
        <div className="mt-6 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-600">
          Intentos demo restantes: 2
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: '1. Selecciona una propiedad', detail: 'Escoge una propiedad habilitada para edición visual.' },
          { title: '2. Describe los cambios', detail: 'Explica la transformación o usa herramientas rápidas.' },
          { title: '3. Visualiza una propuesta', detail: 'Obtén una vista previa conceptual premium en segundos.' },
        ].map((step) => (
          <div key={step.title} className="glass rounded-2xl p-5 shadow-premium">
            <p className="text-sm font-semibold text-brand-600">{step.title}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.detail}</p>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        <h2 className="text-2xl font-semibold">Propiedades habilitadas para edición visual</h2>
        {loading && <p className="text-slate-500">Cargando propiedades editables...</p>}
        {error && <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}
        {!loading && !editableProperties.length && (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-500">
            Aún no hay propiedades con edición visual habilitada. Activa la opción desde el panel admin.
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {editableProperties.map((property) => {
            const image = getPrimaryImageUrl(property) || 'https://via.placeholder.com/1200x800?text=Propiedad';
            return (
              <motion.article
                key={property.id}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900"
              >
                <img src={image} alt={property.titulo} className="h-56 w-full object-cover" loading="lazy" />
                <div className="space-y-4 p-5">
                  <h3 className="text-lg font-semibold">{property.titulo}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{property.ubicacion}</p>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {property.tipo}
                    </span>
                    <span className="font-semibold text-brand-600">{currency.format(property.precio || 0)}</span>
                  </div>
                  <Button className="w-full" onClick={() => handleSelectProperty(property)}>
                    Editar propiedad
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {selectedProperty && (
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_22px_50px_rgba(15,23,42,0.12)] md:grid-cols-[1.05fr_1fr] md:p-8 dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-4">
            <img
              src={getPrimaryImageUrl(selectedProperty) || 'https://via.placeholder.com/1200x800?text=Propiedad'}
              alt={selectedProperty.titulo}
              className="h-72 w-full rounded-2xl object-cover shadow-lg"
            />
            <h3 className="text-2xl font-semibold">{selectedProperty.titulo}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">{selectedProperty.ubicacion} · {selectedProperty.tipo}</p>
            <p className="text-lg font-semibold text-brand-600">{currency.format(selectedProperty.precio || 0)}</p>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={14} /> Propiedad habilitada para edición visual
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Las visualizaciones son conceptuales y no sustituyen diseño profesional.
            </p>
          </div>

          <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-950/60">
            <h4 className="text-xl font-semibold">Panel de edición premium</h4>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe cómo te gustaría transformar esta propiedad…"
              className="min-h-40 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm outline-none ring-brand-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
            />

            <div>
              <p className="mb-2 text-sm font-semibold">Herramientas rápidas</p>
              <div className="flex flex-wrap gap-2">
                {quickTools.map((tool) => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggleTool(tool)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${selectedTools.includes(tool)
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="font-semibold">Estilo</span>
                <select value={selectedStyle} onChange={(event) => setSelectedStyle(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
                  {styleOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-semibold">Nivel de cambio</span>
                <select value={changeLevel} onChange={(event) => setChangeLevel(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
                  {changeLevels.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-semibold">Visualización</span>
                <select value={visualizationType} onChange={(event) => setVisualizationType(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
                  {visualizationTypes.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <Button
              className="w-full text-base"
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
            >
              <span className="inline-flex items-center gap-2"><Wand2 size={16} /> Generar visualización</span>
            </Button>

            {isGenerating && (
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-700">
                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                  <LoaderCircle size={16} className="animate-spin" /> Procesando propuesta visual…
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-md dark:border-brand-900/50 dark:bg-slate-900">
                <p className="font-semibold text-brand-600">Vista previa conceptual</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Imagen original</p>
                    <img src={getPrimaryImageUrl(selectedProperty) || 'https://via.placeholder.com/1200x800?text=Propiedad'} alt="Original" className="h-36 w-full rounded-xl object-cover" />
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Imagen conceptual</p>
                    <div className="relative">
                      <img src={getPrimaryImageUrl(selectedProperty) || 'https://via.placeholder.com/1200x800?text=Conceptual'} alt="Conceptual" className="h-36 w-full rounded-xl object-cover" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-brand-500/35 via-transparent to-amber-300/35" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p><strong>Resumen:</strong> {result.summary}</p>
                  <p><strong>Estilo seleccionado:</strong> {result.style}</p>
                  <p><strong>Nivel de cambio:</strong> {result.level}</p>
                  <p><strong>Tipo de visualización:</strong> {result.visualizationType}</p>
                  <p><strong>Herramientas usadas:</strong> {result.tools.length ? result.tools.join(', ') : 'Ninguna herramienta rápida seleccionada'}</p>
                  <p className="inline-flex items-center gap-2"><CalendarClock size={14} /> {result.date}</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <Button variant="secondary" className="text-sm">Solicitar con asesor</Button>
                  <Button variant="outline" className="text-sm">Guardar idea</Button>
                  <Button variant="secondary" className="text-sm" onClick={() => setResult(null)}>Editar nuevamente</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default AIPropertyDesignPage;
