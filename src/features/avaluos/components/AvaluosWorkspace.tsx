import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import TerrenoAvaluoForm from '../forms/TerrenoAvaluoForm';
import AvaluoTerrenoResultCard from './AvaluoTerreoResultCard';
import { useTerrenoAvaluo } from '../hooks/useTerrenoAvaluo';
import { PropertyTypeCards } from './PropertyTypeCards';
import { AvaluoHistoryPanel } from './AvaluoHistoryPanel';
import { useAvaluosHistory } from '../hooks/useAvaluosHistory';
import type { PropertyType, TerrenoInput } from '../types/avaluo.types';

export default function AvaluosWorkspace() {
  const { user } = useAuth();
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [form, setForm] = useState<Partial<TerrenoInput>>({ servicios: [] });
  const { loading, result, errors, submitTerreno } = useTerrenoAvaluo(user?.uid);
  const { items } = useAvaluosHistory(user?.uid);

  return <main className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b1320] px-4 py-10'>
    <div className='mx-auto max-w-7xl'>
      <h1 className='text-3xl font-bold text-white'>Plataforma PropTech de Avalúos · Nicaragua</h1>
      <p className='text-slate-300 mt-2'>Selecciona tipo de propiedad para iniciar análisis técnico.</p>
      <div className='mt-8 rounded-2xl border border-amber-500/30 bg-slate-900/50 p-6'>
        <PropertyTypeCards value={propertyType} onChange={setPropertyType} />
        {propertyType && propertyType !== 'terreno' && <p className='mt-5 text-amber-200'>Tipo seleccionado: {propertyType}. El cálculo técnico activo está disponible para Terreno en esta versión profesional base.</p>}
        {propertyType === 'terreno' && <TerrenoAvaluoForm value={form} errors={errors} onChange={(k,v)=>setForm((p)=>({ ...p, [k]: v }))} onSubmit={() => submitTerreno(form, propertyType)} loading={loading} />}
      </div>
      <AvaluoTerrenoResultCard result={result} />
      <AvaluoHistoryPanel items={items} />
    </div>
  </main>;
}
