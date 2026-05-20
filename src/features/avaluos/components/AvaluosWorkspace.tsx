import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import TerrenoForm from '../forms/TerrenoForm';
import CasaForm from '../forms/CasaForm';
import QuintaForm from '../forms/QuintaForm';
import FincaForm from '../forms/FincaForm';
import BodegaForm from '../forms/BodegaForm';
import ComercialForm from '../forms/ComercialForm';
import AvaluoTerrenoResultCard from './AvaluoTerreoResultCard';
import { useAvaluoSubmission } from '../hooks/useAvaluoSubmission';
import { PropertyTypeCards } from './PropertyTypeCards';
import { AvaluoHistoryPanel } from './AvaluoHistoryPanel';
import { useAvaluosHistory } from '../hooks/useAvaluosHistory';
import type { PropertyType, TerrenoInput } from '../types/avaluo.types';

export default function AvaluosWorkspace() {
  const { user } = useAuth();
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [form, setForm] = useState<Partial<TerrenoInput> & Record<string, unknown>>({ servicios: [] });
  const { loading, result, errors, submit: handleCalculate } = useAvaluoSubmission(user?.uid);
  const { items } = useAvaluosHistory(user?.uid);

  return <main className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b1320] px-4 py-10'>
    <div className='mx-auto max-w-7xl'>
      <h1 className='text-3xl font-bold text-white'>Plataforma PropTech de Avalúos · Nicaragua</h1>
      <p className='text-slate-300 mt-2'>Selecciona tipo de propiedad para iniciar análisis técnico.</p>
      <div className='mt-8 rounded-2xl border border-amber-500/30 bg-slate-900/50 p-6'>
        <PropertyTypeCards value={propertyType} onChange={(t)=>{ setPropertyType(t); setForm({ servicios: [] }); }} />
        <div className='mt-2 min-h-[320px] transition-all duration-300'>
          {propertyType === 'terreno' && <TerrenoForm value={form as Partial<TerrenoInput>} errors={errors} onChange={(k,v)=>setForm((p)=>({ ...p, [k]: v }))} onSubmit={() => handleCalculate(form, propertyType)} loading={loading} />}
          {propertyType === 'casa' && <CasaForm value={form as Record<string, unknown>} onChange={(k,v)=>setForm((p)=>({ ...p, [k]: v }))} onSubmit={() => handleCalculate(form as Record<string, unknown>, propertyType)} loading={loading} />}
          {propertyType === 'quinta' && <QuintaForm value={form as Record<string, unknown>} onChange={(k,v)=>setForm((p)=>({ ...p, [k]: v }))} onSubmit={() => handleCalculate(form as Record<string, unknown>, propertyType)} loading={loading} />}
          {propertyType === 'finca' && <FincaForm value={form as Record<string, unknown>} onChange={(k,v)=>setForm((p)=>({ ...p, [k]: v }))} onSubmit={() => handleCalculate(form as Record<string, unknown>, propertyType)} loading={loading} />}
          {propertyType === 'bodega' && <BodegaForm value={form as Record<string, unknown>} onChange={(k,v)=>setForm((p)=>({ ...p, [k]: v }))} onSubmit={() => handleCalculate(form as Record<string, unknown>, propertyType)} loading={loading} />}
          {propertyType === 'comercial' && <ComercialForm value={form as Record<string, unknown>} onChange={(k,v)=>setForm((p)=>({ ...p, [k]: v }))} onSubmit={() => handleCalculate(form as Record<string, unknown>, propertyType)} loading={loading} />}
        </div>
      </div>
      <AvaluoTerrenoResultCard result={result} />
      <AvaluoHistoryPanel items={items} />
    </div>
  </main>;
}
