import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import TerrenoAvaluoForm from '../forms/TerrenoAvaluoForm';
import AvaluoTerrenoResultCard from './AvaluoTerreoResultCard';
import { useTerrenoAvaluo } from '../hooks/useTerrenoAvaluo';
import type { CaracteristicasTerreno } from '../types/avaluo.types';

export default function AvaluosWorkspace() {
  const { user } = useAuth();
  const { loading, result, errors, submitTerreno } = useTerrenoAvaluo(user?.uid);
  const [form, setForm] = useState<Partial<CaracteristicasTerreno>>({ servicios: [] });

  const onChange = <K extends keyof CaracteristicasTerreno>(key: K, value: CaracteristicasTerreno[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className='min-h-screen bg-slate-950 px-4 py-10'>
      <div className='mx-auto max-w-6xl'>
        <h1 className='text-3xl font-bold text-white'>Módulo profesional de avalúos</h1>
        <p className='mt-2 text-slate-300'>Motor técnico modular para terrenos en Matagalpa y Estelí.</p>
        <div className='mt-8 rounded-2xl border border-amber-500/30 bg-slate-900/60 p-6'>
          <div className='mb-4 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300'>FASE INICIAL · TERRENO</div>
          <TerrenoAvaluoForm value={form} errors={errors} onChange={onChange} onSubmit={() => submitTerreno(form)} loading={loading} />
          <AvaluoTerrenoResultCard result={result} />
        </div>
      </div>
    </main>
  );
}
