import { useMemo } from 'react';

const formatMoney = (value) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value || 0));
const formatNumber = (value) => new Intl.NumberFormat('es-NI', { maximumFractionDigits: 2 }).format(Number(value || 0));
const toDate = (value) => {
  if (!value) return 'Sin fecha';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });
};

const hiddenFields = new Set(['zonaData', 'titulo', 'ciudad', 'zona', 'areaTerreno']);
const terrainPriority = ['unidadArea', 'areaOriginal', 'areaM2Convertida', 'tipoTerritorio', 'tipoSuelo', 'topografia', 'accesoGeneral', 'tipoVia', 'nivelTrafico', 'seguridadZona', 'formaTerreno', 'entorno', 'usoPotencial', 'desarrolloUrbano', 'recursosNaturales', 'riesgos', 'servicios', 'nivelDeforestacion'];
const labels = {
  unidadArea: 'Unidad de área usada',
  areaOriginal: 'Área original',
  areaM2Convertida: 'Área convertida a m²',
  tipoTerritorio: 'Categoría territorial',
  tipoSuelo: 'Tipo de suelo',
  topografia: 'Topografía',
  accesoGeneral: 'Acceso general',
  tipoVia: 'Tipo de calle / vía',
  nivelTrafico: 'Nivel de tráfico',
  seguridadZona: 'Seguridad de la zona',
  formaTerreno: 'Forma del terreno',
  entorno: 'Entorno',
  usoPotencial: 'Uso potencial',
  desarrolloUrbano: 'Desarrollo urbano',
  recursosNaturales: 'Recursos naturales',
  riesgos: 'Riesgos',
  servicios: 'Servicios',
  nivelDeforestacion: 'Deforestación',
};
const labelize = (key) => labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\s+/g, ' ').trim().replace(/^./, (m) => m.toUpperCase());
const valueText = (key, val) => {
  if (Array.isArray(val)) return val.join(', ');
  if (key === 'unidadArea') return val === 'manzana' ? 'Manzanas' : 'Metros cuadrados';
  if (key === 'areaOriginal' || key === 'areaM2Convertida') return `${formatNumber(val)} ${key === 'areaOriginal' ? '' : 'm²'}`.trim();
  return String(val);
};
const impactText = (coeficiente) => {
  const pct = (Number(coeficiente || 1) - 1) * 100;
  if (Math.abs(pct) < 0.1) return '0%';
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
};
const isScaleOrRuralCap = (factor) => /escala|grandes extensiones|tope técnico|normalización|manzana/i.test(String(factor));
const normalizeImpactSign = (coef) => {
  const numericCoef = Number(coef.coeficiente || 1);
  if (!isScaleOrRuralCap(coef.factor) || numericCoef <= 1) return { ...coef, coeficiente: numericCoef, impacto: coef.impacto || impactText(numericCoef) };
  const correctedCoef = numericCoef > 0 ? Math.min(1, 1 / numericCoef) : 1;
  return { ...coef, coeficiente: correctedCoef, impacto: impactText(correctedCoef) };
};
const normalizeCoeficientes = (coeficientesAplicados) => (Array.isArray(coeficientesAplicados)
  ? coeficientesAplicados
  : Object.entries(coeficientesAplicados || {}).map(([factor, coeficiente]) => ({ factor: labelize(factor), valorAplicado: Number(coeficiente).toFixed(3), coeficiente: Number(coeficiente), impacto: impactText(coeficiente) }))
).map(normalizeImpactSign);

export default function AvaluoReportView({ avaluo }) {
  const esTerreno = avaluo?.tipoPropiedad === 'terreno';
  const caracteristicas = useMemo(() => {
    const entries = Object.entries(avaluo?.caracteristicas || {})
      .filter(([key, val]) => !hiddenFields.has(key) && val !== '' && val !== null && val !== undefined && !(Array.isArray(val) && !val.length));
    const sorted = esTerreno
      ? entries.sort(([a], [b]) => {
        const ia = terrainPriority.indexOf(a); const ib = terrainPriority.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      })
      : entries;
    return sorted.map(([key, val]) => [labelize(key), valueText(key, val)]);
  }, [avaluo, esTerreno]);

  const coeficientes = useMemo(() => normalizeCoeficientes(avaluo?.coeficientesAplicados), [avaluo]);

  const analisis = esTerreno
    ? `El terreno evaluado en ${avaluo?.zona || 'zona no definida'}, ${avaluo?.ciudad || 'ciudad no definida'}, fue analizado con base en área convertida, zona cerrada de Matagalpa, categoría territorial, suelo, accesos, servicios, riesgos y coeficientes técnicos. La clasificación ${avaluo?.zonaSnapshot?.clasificacion || 'N/D'} y el factor de plusvalía de zona se integran al factor global para generar una referencia profesional de mercado.`
    : `La propiedad evaluada (${avaluo?.tipoPropiedad || 'inmueble'}) en ${avaluo?.zona || 'zona no definida'}, ${avaluo?.ciudad || 'ciudad no definida'}, presenta condiciones ${avaluo?.zonaSnapshot?.clasificacion || 'urbanas'}. Según las variables ingresadas y los coeficientes aplicados, el resultado técnico muestra una estimación consistente para uso de referencia comercial.`;

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
        <Field label="Plusvalía" value={impactText(avaluo?.zonaSnapshot?.factorPlusvalia)} />
      </section>

      {esTerreno && <Section title="Resumen técnico de terreno">
        <div className="grid gap-4 md:grid-cols-3">
          <Highlight label="Unidad de área" value={avaluo?.unidadArea === 'manzana' ? 'Manzanas' : 'Metros cuadrados'} />
          <Highlight label="Área convertida" value={`${formatNumber(avaluo?.areaM2Convertida || avaluo?.caracteristicas?.areaM2Convertida)} m²`} />
          <Highlight label="Valor base" value={formatMoney(avaluo?.valorBase)} />
          <Highlight label="Valor/m² final" value={formatMoney(avaluo?.valorM2)} />
          <Highlight label="Rango mercado" value={`${formatMoney(avaluo?.rangoMercado?.minimo)} - ${formatMoney(avaluo?.rangoMercado?.maximo)}`} />
          <Highlight label="Nivel confianza" value={avaluo?.nivelConfianza || 'N/D'} />
        </div>
      </Section>}

      <Section title="Características evaluadas">
        <div className="grid gap-3 md:grid-cols-2">
          {caracteristicas.map(([label, value]) => <Field key={label} label={label} value={value} />)}
        </div>
      </Section>

      <Section title="Análisis técnico">
        <p className="leading-7 text-slate-700">{analisis}</p>
      </Section>

      <Section title="Coeficientes aplicados">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600"><tr><th className="px-4 py-2">Factor</th><th className="px-4 py-2">Valor aplicado</th><th className="px-4 py-2">Impacto</th></tr></thead>
            <tbody>{coeficientes.map((coef, index) => <tr key={`${coef.factor}-${index}`} className="border-t border-slate-200"><td className="px-4 py-2 font-medium">{coef.factor}</td><td className="px-4 py-2">{coef.valorAplicado}</td><td className={Number(coef.coeficiente) >= 1 ? 'px-4 py-2 text-emerald-700' : 'px-4 py-2 text-red-700'}>{coef.impacto}</td></tr>)}</tbody>
          </table>
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
