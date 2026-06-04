export default function AvaluoTerrenoResultCard({ result, onSave, canSave }) {
  if (!result) return null;
  const coeficientes = Array.isArray(result.coeficientesAplicados)
    ? result.coeficientesAplicados
    : Object.entries(result.coeficientesAplicados || {}).map(([factor, coeficiente]) => ({ factor, valorAplicado: Number(coeficiente).toFixed(3), coeficiente: Number(coeficiente), impacto: impactText(Number(coeficiente)) }));

  return <section className='mt-8 rounded-2xl border border-blue-900 bg-slate-900 p-6 text-slate-200'>
    <h3 className='text-xl font-bold text-blue-200'>Dashboard técnico de avalúo</h3>
    <div className='mt-4 grid gap-3 md:grid-cols-3'>
      {item('Área original', `${toSafeNumber(result.areaOriginal).toLocaleString('es-NI', { maximumFractionDigits: 2 })} ${result.unidadArea === 'manzana' ? 'manzanas' : 'm²'}`, false)}
      {item('Unidad seleccionada', result.unidadArea === 'manzana' ? 'Manzanas' : 'Metros cuadrados', false)}
      {item('Área convertida a m²', `${toSafeNumber(result.areaM2Convertida).toLocaleString('es-NI', { maximumFractionDigits: 2 })} m²`, false)}
      {item('Valor base del terreno', result.valorBase)}
      {item('Valor final estimado', result.valorFinalEstimado)}
      {item('Valor/m²', result.valorM2)}
      {item('Clasificación zona', result.clasificacionZona, false)}
      {item('Plusvalía aplicada', impactText(result.plusvaliaAplicada), false)}
      {item('Factor global', toSafeNumber(result.factorGlobal, 1).toFixed(3), false)}
      {item('Rango mercado', `${toMoney(result.rangoMercado?.minimo, 0)} - ${toMoney(result.rangoMercado?.maximo, 0)}`, false)}
      {item('Nivel confianza', result.nivelConfianza, false)}
      {item('Valor terreno m² zona', result.valorTerrenoM2)}
    </div>

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
const item = (label, val, money = true) => <div className='rounded-xl border border-slate-700 bg-slate-800 p-3'><p className='text-xs text-slate-400'>{label}</p><p className='text-lg font-semibold'>{money ? toMoney(val) : toText(val)}</p></div>;
