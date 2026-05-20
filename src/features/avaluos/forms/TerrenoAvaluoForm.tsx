import { ZONAS_POR_CIUDAD } from '../constants/locations';
import type { ServicioBasico, TerrenoInput } from '../types/avaluo.types';
import type { TerrenoFormErrors } from '../validators/terreno.validator';

const servicios: { key: ServicioBasico; label: string }[] = [
  { key: 'agua', label: 'Agua' }, { key: 'energia', label: 'Energía' }, { key: 'internet', label: 'Internet' }, { key: 'drenaje', label: 'Drenaje' }, { key: 'callePavimentada', label: 'Calle pavimentada' },
];

export default function TerrenoAvaluoForm({ value, errors, onChange, onSubmit, loading }: { value: Partial<TerrenoInput>; errors: TerrenoFormErrors; onChange: <K extends keyof TerrenoInput>(key: K, value: TerrenoInput[K]) => void; onSubmit: () => void; loading: boolean }) {
  const zonas = value.ciudad ? ZONAS_POR_CIUDAD[value.ciudad] : [];
  return <form onSubmit={(e)=>{e.preventDefault(); onSubmit();}} className='grid gap-4 mt-6'>
    <div className='grid md:grid-cols-2 gap-4'>
      <select className='input-avaluo' value={value.ciudad ?? ''} onChange={(e)=>{onChange('ciudad', e.target.value as TerrenoInput['ciudad']); onChange('zona','' as TerrenoInput['zona']);}}><option value=''>Ciudad</option><option>Matagalpa</option><option>Estelí</option></select>
      <select className='input-avaluo' value={value.zona ?? ''} onChange={(e)=>onChange('zona', e.target.value)} disabled={!value.ciudad}><option value=''>Zona</option>{zonas.map((z)=><option key={z.zona}>{z.zona}</option>)}</select>
      <input type='number' className='input-avaluo' placeholder='Área terreno m²' value={value.areaTerreno ?? ''} onChange={(e)=>onChange('areaTerreno', Number(e.target.value))} />
      <select className='input-avaluo' value={value.topografia ?? ''} onChange={(e)=>onChange('topografia', e.target.value as TerrenoInput['topografia'])}><option value=''>Topografía</option><option value='plano'>Plano</option><option value='semiPlano'>Semi plano</option><option value='inclinado'>Inclinado</option><option value='quebrado'>Quebrado</option></select>
      <select className='input-avaluo' value={value.acceso ?? ''} onChange={(e)=>onChange('acceso', e.target.value as TerrenoInput['acceso'])}><option value=''>Acceso</option><option value='pavimentado'>Pavimentado</option><option value='adoquinado'>Adoquinado</option><option value='macadan'>Macadán</option><option value='tierra'>Tierra</option></select>
      <select className='input-avaluo' value={value.usoPotencial ?? ''} onChange={(e)=>onChange('usoPotencial', e.target.value as TerrenoInput['usoPotencial'])}><option value=''>Uso potencial</option><option value='residencial'>Residencial</option><option value='comercial'>Comercial</option><option value='industrial'>Industrial</option><option value='turistico'>Turístico</option><option value='agricola'>Agrícola</option></select>
    </div>
    <div className='flex flex-wrap gap-2'>{servicios.map((s)=><label key={s.key} className='rounded-lg border border-slate-600 px-3 py-2 text-slate-200'><input type='checkbox' className='mr-2' checked={value.servicios?.includes(s.key)} onChange={(e)=>onChange('servicios', e.target.checked ? [...(value.servicios ?? []), s.key] : (value.servicios ?? []).filter((it)=>it!==s.key))}/>{s.label}</label>)}</div>
    <p className='text-rose-300 text-sm'>{Object.values(errors)[0]}</p>
    <button disabled={loading} className='rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-900'>{loading?'Calculando...':'Calcular avalúo técnico'}</button>
  </form>;
}
