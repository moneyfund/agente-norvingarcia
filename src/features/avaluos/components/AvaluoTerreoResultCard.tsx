import type { ResultadoAvaluo } from '../types/avaluo.types';

export default function AvaluoTerrenoResultCard({ result }: { result: ResultadoAvaluo | null }) {
  if (!result) return null;
  return <section className='mt-6 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6'>
    <h3 className='text-xl font-bold text-white'>Resultado profesional</h3>
    <div className='mt-4 grid gap-4 md:grid-cols-3'>
      <Metric label='Valor terreno' value={result.valorTerreno} />
      <Metric label='Valor construcción' value={result.valorConstruccion} />
      <Metric label='Valor final' value={result.valorFinal} />
    </div>
    <p className='mt-4 text-slate-200'>Clasificación urbana: <strong>{result.clasificacionUrbana}</strong> · Plusvalía: <strong>{result.nivelPlusvalia}x</strong></p>
  </section>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className='rounded-xl bg-slate-950/70 p-4 text-slate-200'><div className='text-sm text-slate-400'>{label}</div><div className='text-2xl font-semibold text-amber-300'>${value.toLocaleString()}</div></div>;
}
