import type { ResultadoAvaluo } from '../types/avaluo.types';

export default function AvaluoTerrenoResultCard({ result }: { result: ResultadoAvaluo | null }) {
  if (!result) return null;
  return <section className='mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-6'>
    <h3 className='text-xl font-bold text-white'>Dashboard técnico de resultado</h3>
    <div className='mt-4 grid gap-3 md:grid-cols-4'>
      <Metric label='Valor terreno' value={result.valorTerreno} />
      <Metric label='Valor por m²' value={result.valorPorM2Final} />
      <Metric label='Plusvalía' value={result.factorPlusvalia} suffix='x' />
      <Metric label='Valor final estimado' value={result.valorFinalEstimado} />
    </div>
    <p className='text-slate-300 mt-4'>Clasificación urbana: <strong>{result.clasificacionUrbana}</strong> · Confianza: <strong>{result.nivelConfianza}</strong></p>
    <p className='text-slate-300'>Rango de mercado: US$ {result.rangoMercado.minimo.toLocaleString()} - US$ {result.rangoMercado.maximo.toLocaleString()}</p>
  </section>;
}

function Metric({ label, value, suffix='' }: { label: string; value: number; suffix?: string }) { return <div className='rounded-xl bg-slate-950/80 p-3'><p className='text-slate-400 text-xs'>{label}</p><p className='text-amber-300 text-xl font-semibold'>US$ {value.toLocaleString()}{suffix}</p></div>; }
