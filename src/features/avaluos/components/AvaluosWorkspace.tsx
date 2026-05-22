import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import TerrenoForm from '../forms/TerrenoForm';
import CasaForm from '../forms/CasaForm';
import AvaluoTerrenoResultCard from './AvaluoTerreoResultCard';
import { useAvaluoSubmission } from '../hooks/useAvaluoSubmission';
import { PropertyTypeCards } from './PropertyTypeCards';
import { AvaluoHistoryPanel } from './AvaluoHistoryPanel';
import { useAvaluosHistory } from '../hooks/useAvaluosHistory';

export default function AvaluosWorkspace() {
  const { user } = useAuth();
  const [propertyType, setPropertyType] = useState<any>(null);
  const [form, setForm] = useState<any>({ ciudad: 'Matagalpa', zona: '', zonaData: null, servicios: [] });
  const { loading, result, error, submit, save } = useAvaluoSubmission(user?.uid);
  const { items, refresh } = useAvaluosHistory(user?.uid);

  const handleCalculate = async () => {
    if (!propertyType) return;
    await submit(form, propertyType);
  };

  const handleSave = async () => {
    const saved = await save();
    if (saved) await refresh();
  };

  return <main className='min-h-screen bg-gradient-to-br from-[#0b0f17] via-[#111827] to-[#10233c] px-4 py-10'>
    <div className='mx-auto max-w-7xl'>
      <h1 className='text-3xl font-bold text-white'>Plataforma Profesional de Avalúos</h1>
      <p className='text-slate-300 mt-2'>Peritaje inmobiliario técnico · Matagalpa · Casas y Terrenos</p>
      <div className='mt-8 rounded-2xl border border-amber-500/30 bg-slate-950/60 p-6'>
        <PropertyTypeCards value={propertyType} onChange={(t)=>{ setPropertyType(t); setForm({ ciudad: 'Matagalpa', zona: '', zonaData: null, servicios: [] }); }} />
        <div className='mt-6'>{propertyType==='terreno'&&<TerrenoForm value={form} onChange={(k,v)=>setForm((p)=>({ ...p,[k]:v }))} onSubmit={handleCalculate} loading={loading} />}{propertyType==='casa'&&<CasaForm value={form} onChange={(k,v)=>setForm((p)=>({ ...p,[k]:v }))} onSubmit={handleCalculate} loading={loading} />}</div>
      </div>
      {!!error && <p className='mt-4 rounded-xl border border-red-500/40 bg-red-900/30 p-3 text-red-100'>{error}</p>}
      <AvaluoTerrenoResultCard result={result} canSave={!!user} onSave={handleSave} />
      <AvaluoHistoryPanel items={items} />
    </div>
  </main>;
}
