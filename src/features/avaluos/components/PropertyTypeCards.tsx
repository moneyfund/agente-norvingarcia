import type { PropertyType } from '../types/avaluo.types';

const ITEMS: { key: PropertyType; label: string; icon: string }[] = [
  { key: 'terreno', label: 'Terreno', icon: '🧭' },
  { key: 'casa', label: 'Casa', icon: '🏠' },
  { key: 'finca', label: 'Finca', icon: '🌾' },
  { key: 'quinta', label: 'Quinta', icon: '🏡' },
  { key: 'bodega', label: 'Bodega', icon: '🏭' },
  { key: 'comercial', label: 'Comercial', icon: '🏢' },
];

export function PropertyTypeCards({ value, onChange }: { value: PropertyType | null; onChange: (t: PropertyType) => void }) {
  return <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
    {ITEMS.map((item) => <button key={item.key} onClick={() => onChange(item.key)} className={`rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${value===item.key ? 'border-amber-400 bg-slate-800 ring-1 ring-amber-400' : 'border-slate-700 bg-slate-900/80'}`}>
      <div className='text-3xl'>{item.icon}</div><div className='mt-3 text-lg font-semibold text-slate-100'>{item.label}</div>
    </button>)}
  </section>;
}
