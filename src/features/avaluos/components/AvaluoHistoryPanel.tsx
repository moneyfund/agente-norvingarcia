import type { AvaluoRecord } from '../types/avaluo.types';

export function AvaluoHistoryPanel({ items }: { items: AvaluoRecord[] }) {
  return <section className='mt-8'><h3 className='text-xl font-semibold text-white'>Historial técnico</h3>
  <div className='mt-4 grid gap-3 md:grid-cols-2'>
    {items.map((item) => <article key={item.id} className='rounded-2xl border border-slate-700 bg-slate-900/70 p-4'>
      <p className='text-slate-100 font-semibold'>{item.tipoPropiedad.toUpperCase()} · {item.zona}</p>
      <p className='text-slate-400 text-sm'>{item.ciudad} · {new Date(item.createdAt).toLocaleString()}</p>
      <p className='text-amber-300 font-bold mt-2'>US$ {item.valorFinal.toLocaleString()}</p>
      <p className='text-slate-300 text-sm'>Confianza: {item.nivelConfianza}</p>
    </article>)}
  </div></section>;
}
