import { type ReactNode } from 'react';

export function FieldCard({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return <section className='rounded-2xl border border-slate-700/80 bg-slate-950/60 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]'>
    <header className='mb-3 flex items-center gap-2 text-slate-100'><span>{icon}</span><h3 className='text-sm font-semibold tracking-wide uppercase text-slate-300'>{title}</h3></header>
    <div className='grid gap-3 md:grid-cols-2'>{children}</div>
  </section>;
}

export const inputClass = 'h-11 rounded-xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20';
