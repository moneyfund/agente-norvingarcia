import type { CaracteristicasTerreno, ServicioBasico } from '../types/avaluo.types';
import type { TerrenoFormErrors } from '../validators/terreno.validator';

const servicios: ServicioBasico[] = ['agua', 'energia', 'internet', 'drenaje'];

interface Props {
  value: Partial<CaracteristicasTerreno>;
  errors: TerrenoFormErrors;
  onChange: <K extends keyof CaracteristicasTerreno>(key: K, value: CaracteristicasTerreno[K]) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function TerrenoAvaluoForm({ value, errors, onChange, onSubmit, loading }: Props) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className='grid gap-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-2xl'>
      <div className='grid gap-4 md:grid-cols-2'>
        <input className='input-avaluo' placeholder='Municipio' value={value.municipio ?? ''} onChange={(e) => onChange('municipio', e.target.value)} />
        <input className='input-avaluo' placeholder='Zona' value={value.zona ?? ''} onChange={(e) => onChange('zona', e.target.value)} />
        <input type='number' min={0} className='input-avaluo' placeholder='Área terreno m²' value={value.areaTerreno ?? ''} onChange={(e) => onChange('areaTerreno', Number(e.target.value))} />
        <select className='input-avaluo' value={value.ciudad ?? ''} onChange={(e) => onChange('ciudad', e.target.value as CaracteristicasTerreno['ciudad'])}>
          <option value=''>Ciudad objetivo</option><option>Matagalpa</option><option>Estelí</option>
        </select>
      </div>
      <div className='grid gap-4 md:grid-cols-3'>
        <select className='input-avaluo' value={value.topografia ?? ''} onChange={(e) => onChange('topografia', e.target.value as CaracteristicasTerreno['topografia'])}><option value=''>Topografía</option><option value='plano'>Plano</option><option value='semiPlano'>Semi plano</option><option value='inclinado'>Inclinado</option><option value='quebrado'>Quebrado</option></select>
        <select className='input-avaluo' value={value.acceso ?? ''} onChange={(e) => onChange('acceso', e.target.value as CaracteristicasTerreno['acceso'])}><option value=''>Acceso</option><option value='pavimentado'>Pavimentado</option><option value='adoquinado'>Adoquinado</option><option value='macadan'>Macadán</option><option value='tierra'>Tierra</option></select>
        <select className='input-avaluo' value={value.usoPotencial ?? ''} onChange={(e) => onChange('usoPotencial', e.target.value as CaracteristicasTerreno['usoPotencial'])}><option value=''>Uso potencial</option><option value='residencial'>Residencial</option><option value='comercial'>Comercial</option><option value='industrial'>Industrial</option><option value='agricola'>Agrícola</option><option value='turistico'>Turístico</option></select>
      </div>
      <div className='flex flex-wrap gap-3'>
        {servicios.map((s) => <label key={s} className='rounded-lg border border-slate-600 px-3 py-2 text-slate-200'><input type='checkbox' className='mr-2' checked={value.servicios?.includes(s)} onChange={(e) => onChange('servicios', e.target.checked ? [...(value.servicios ?? []), s] : (value.servicios ?? []).filter((it) => it !== s))} />{s}</label>)}
      </div>
      <textarea className='input-avaluo' placeholder='Observaciones técnicas' value={value.observaciones ?? ''} onChange={(e) => onChange('observaciones', e.target.value)} />
      <div className='text-sm text-rose-300'>{Object.values(errors)[0]}</div>
      <button disabled={loading} className='rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60'>{loading ? 'Procesando...' : 'Calcular avalúo técnico'}</button>
    </form>
  );
}
