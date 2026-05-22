import { useMemo } from 'react';

const formatMoney = (value) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value || 0));
const toDate = (value) => {
  if (!value) return 'Sin fecha';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });
};

const hiddenFields = new Set(['zonaData', 'titulo', 'ciudad', 'zona']);
const labelize = (key) => key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\s+/g, ' ').trim().replace(/^./, (m) => m.toUpperCase());

export default function AvaluoReportView({ avaluo }) {
  const caracteristicas = useMemo(() => Object.entries(avaluo?.caracteristicas || {})
    .filter(([key, val]) => !hiddenFields.has(key) && val !== '' && val !== null && val !== undefined && !(Array.isArray(val) && !val.length))
    .map(([key, val]) => [labelize(key), Array.isArray(val) ? val.join(', ') : String(val)]), [avaluo]);

  const coeficientes = useMemo(() => Object.entries(avaluo?.coeficientesAplicados || {})
    .filter(([, val]) => val !== null && val !== undefined && val !== ''), [avaluo]);

  const analisis = `La propiedad evaluada (${avaluo?.tipoPropiedad || 'inmueble'}) en ${avaluo?.zona || 'zona no definida'}, ${avaluo?.ciudad || 'ciudad no definida'}, presenta condiciones ${avaluo?.zonaSnapshot?.clasificacion || 'urbanas'} con plusvalía ${avaluo?.zonaSnapshot?.plusvalia || 'estable'}. Según las variables ingresadas y los coeficientes aplicados, el resultado técnico muestra una estimación consistente para uso de referencia comercial.`;

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 text-slate-800 shadow-2xl md:p-12">
      <header className="border-b border-slate-200 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-full object-cover" />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Norvin García · Real Estate</p>
              <h1 className="text-2xl font-bold">Informe técnico de avalúo</h1>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Fecha: {toDate(avaluo?.createdAtServer || avaluo?.createdAt)}</p>
            <p>Código: {avaluo?.id}</p>
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Field label="Título" value={avaluo?.titulo || 'Avalúo inmobiliario'} />
        <Field label="Tipo de propiedad" value={avaluo?.tipoPropiedad} />
        <Field label="Ciudad" value={avaluo?.ciudad} />
        <Field label="Zona" value={avaluo?.zona} />
        <Field label="Clasificación" value={avaluo?.zonaSnapshot?.clasificacion} />
        <Field label="Plusvalía" value={avaluo?.zonaSnapshot?.plusvalia} />
      </section>

      <Section title="Características evaluadas">
        <div className="grid gap-3 md:grid-cols-2">
          {caracteristicas.map(([label, value]) => <Field key={label} label={label} value={value} />)}
        </div>
      </Section>

      <Section title="Análisis técnico">
        <p className="leading-7 text-slate-700">{analisis}</p>
      </Section>

      <Section title="Coeficientes aplicados">
        <div className="grid gap-3 md:grid-cols-2">
          {coeficientes.map(([k, v]) => <Field key={k} label={labelize(k)} value={Number(v).toFixed(3)} />)}
        </div>
      </Section>

      <Section title="Resultado final">
        <div className="grid gap-4 md:grid-cols-2">
          <Highlight label="Valor terreno" value={formatMoney(avaluo?.valorTerreno)} />
          <Highlight label="Valor construcción" value={formatMoney(avaluo?.valorConstruccion)} />
          <Highlight label="Valor estimado final" value={formatMoney(avaluo?.valorFinal)} />
          <Highlight label="Rango mercado" value={`${formatMoney(avaluo?.rangoMercado?.minimo)} - ${formatMoney(avaluo?.rangoMercado?.maximo)}`} />
          <Highlight label="Nivel confianza" value={avaluo?.nivelConfianza || 'N/D'} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) { return <section className="mt-8"><h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-slate-600">{title}</h2>{children}</section>; }
function Field({ label, value }) { return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs uppercase text-slate-500">{label}</p><p className="font-medium">{value || 'N/D'}</p></div>; }
function Highlight({ label, value }) { return <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs uppercase text-emerald-700">{label}</p><p className="text-xl font-bold text-emerald-900">{value}</p></div>; }
