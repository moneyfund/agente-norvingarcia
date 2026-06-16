export default function AvaluoTerrenoResultCard({ result, onSave, canSave }) {
  if (!result) return null;
  const coeficientes = normalizeCoeficientes(result.coeficientesAplicados);
  const serviciosBasicos = coeficientes.find((coef) => coef.factor === 'Servicios básicos');

  return <section className='mt-8 rounded-2xl border border-blue-900 bg-slate-900 p-6 text-slate-200'>
    <h3 className='text-xl font-bold text-blue-200'>Dashboard técnico de avalúo</h3>
    <div className='mt-4 grid gap-3 md:grid-cols-3'>
      {item('Área original', `${toSafeNumber(result.areaOriginal).toLocaleString('es-NI', { maximumFractionDigits: 2 })} ${result.unidadArea === 'manzana' ? 'manzanas' : 'm²'}`, false)}
      {item('Unidad seleccionada', result.unidadArea === 'manzana' ? 'Manzanas' : 'Metros cuadrados', false)}
      {item('Área convertida a m²', `${toSafeNumber(result.areaM2Convertida).toLocaleString('es-NI', { maximumFractionDigits: 2 })} m²`, false)}
      {item('Valor base del terreno', result.valorBase)}
      {item('Valor bajo', result.lowValue ?? result.rangoMercado?.minimo)}
      {item('Valor estimado', result.estimatedValue ?? result.valorFinalEstimado)}
      {item('Valor alto', result.highValue ?? result.rangoMercado?.maximo)}
      {item('Precio efectivo por m² usado', result.adjustedPriceM2 ?? result.valorM2)}
      {item('Clasificación zona', result.clasificacionZona, false)}
      {item('Plusvalía aplicada', impactText(result.plusvaliaAplicada), false)}
      {item('Factor total aplicado', toSafeNumber(result.factorGlobal, 1).toFixed(3), false)}
      {item('Multiplicador de escala', toSafeNumber(result.scaleMultiplier, 1).toFixed(2), false)}
      {item('Rango estimado de valor', `${toMoney(result.rangoMercado?.minimo, 0)} - ${toMoney(result.rangoMercado?.maximo, 0)}`, false)}
      {item('Nivel confianza', result.nivelConfianza, false)}
      {item('Precio base m² zona', result.basePriceM2 ?? result.valorTerrenoM2)}
      {item('Área equivalente en manzanas', toSafeNumber(result.areaManzanas).toLocaleString('es-NI', { maximumFractionDigits: 2 }), false)}
      {serviciosBasicos && item('Servicios básicos', serviciosBasicos.impacto, false)}
    </div>
    {result.notaNormalizacion && <p className='mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100'>{result.notaNormalizacion}</p>}

    <div className='mt-5 overflow-hidden rounded-xl border border-slate-700'>
      <div className='bg-slate-800 px-4 py-3 font-semibold text-slate-100'>Coeficientes aplicados</div>
      <div className='overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead className='bg-slate-950 text-left text-slate-400'><tr><th className='px-4 py-2'>Factor</th><th className='px-4 py-2'>Valor aplicado</th><th className='px-4 py-2'>Impacto</th></tr></thead>
          <tbody>
            {coeficientes.map((coef, index) => <tr key={`${coef.factor}-${index}`} className='border-t border-slate-700'><td className='px-4 py-2 font-medium'>{coef.factor}</td><td className='px-4 py-2'>{coef.valorAplicado}</td><td className={Number(coef.coeficiente) >= 1 ? 'px-4 py-2 text-emerald-300' : 'px-4 py-2 text-red-300'}>{coef.impacto}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
    {canSave && <button onClick={onSave} className='mt-4 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-slate-900'>Guardar avalúo</button>}
  </section>;
}
const toSafeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const toMoney = (value, digits = 2) => `$${toSafeNumber(value).toFixed(digits)}`;
const toText = (value, fallback = 'N/D') => value === undefined || value === null || value === '' ? fallback : value;
const impactText = (coeficiente) => {
  const pct = (toSafeNumber(coeficiente, 1) - 1) * 100;
  if (Math.abs(pct) < 0.1) return '0%';
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
};
const isScaleOrRuralCap = (factor) => /escala|grandes extensiones|tope técnico|normalización|manzana/i.test(String(factor));
const normalizeImpactSign = (coef) => {
  const numericCoef = toSafeNumber(coef.coeficiente, 1);
  if (!isScaleOrRuralCap(coef.factor) || numericCoef <= 1) return { ...coef, coeficiente: numericCoef, impacto: coef.impacto || impactText(numericCoef) };
  const correctedCoef = numericCoef > 0 ? Math.min(1, 1 / numericCoef) : 1;
  return { ...coef, coeficiente: correctedCoef, impacto: impactText(correctedCoef) };
};
const normalizeCoeficientes = (coeficientesAplicados) => (Array.isArray(coeficientesAplicados)
  ? coeficientesAplicados
  : Object.entries(coeficientesAplicados || {}).map(([factor, coeficiente]) => ({ factor, valorAplicado: Number(coeficiente).toFixed(3), coeficiente: Number(coeficiente), impacto: impactText(Number(coeficiente)) }))
).map(normalizeImpactSign);
const item = (label, val, money = true) => <div className='rounded-xl border border-slate-700 bg-slate-800 p-3'><p className='text-xs text-slate-400'>{label}</p><p className='text-lg font-semibold'>{money ? toMoney(val) : toText(val)}</p></div>;
