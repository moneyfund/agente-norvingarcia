import { type ReactNode } from 'react';
import { ZONAS_POR_CIUDAD } from '../constants/locations';
import type { CiudadObjetivo } from '../types/avaluo.types';
import { FieldCard, inputClass } from './shared';
import { CheckboxGroup } from '../components/fields/CheckboxGroup';
import { SelectField } from '../components/fields/SelectField';
import { ToggleField } from '../components/fields/ToggleField';

type Props = { value: Record<string, unknown>; onChange: (k: string, v: unknown) => void; onSubmit: () => void; loading: boolean; title: string; children: ReactNode; };

const CITY_OPTIONS: CiudadObjetivo[] = ['Matagalpa', 'Estelí'];

function BaseForm({ value, onChange, onSubmit, loading, title, children }: Props) {
  const zonas = value.ciudad ? ZONAS_POR_CIUDAD[value.ciudad as CiudadObjetivo] : [];
  return <form onSubmit={(e)=>{e.preventDefault(); onSubmit();}} className='mt-6 grid gap-4'>
    <FieldCard title={title} icon='📊'>
      <select className={inputClass} value={String(value.ciudad ?? '')} onChange={(e)=>{ onChange('ciudad', e.target.value); onChange('zona', ''); }}>
        <option value=''>Ciudad</option>{CITY_OPTIONS.map((city)=><option key={city} value={city}>{city}</option>)}
      </select>
      <select className={inputClass} value={String(value.zona ?? '')} onChange={(e)=>onChange('zona', e.target.value)} disabled={!value.ciudad}>
        <option value=''>Zona</option>{zonas.map((z)=><option key={z.zona} value={z.zona}>{z.zona}</option>)}
      </select>
      {children}
    </FieldCard>
    <button disabled={loading} className='h-11 rounded-xl bg-amber-400 px-4 font-semibold text-slate-900'>{loading?'Calculando...':'Calcular avalúo técnico'}</button>
  </form>;
}

export const CasaForm = ({ value, onChange, onSubmit, loading }: Omit<Props, 'title'|'children'>) => <BaseForm value={value} onChange={onChange} onSubmit={onSubmit} loading={loading} title='Ficha técnica residencial · Casa'>
  <input type='number' className={inputClass} placeholder='Área terreno m²' value={String(value.areaTerreno ?? '')} onChange={(e)=>onChange('areaTerreno', Number(e.target.value))} />
  <input type='number' className={inputClass} placeholder='Área construcción m²' value={String(value.areaConstruccion ?? '')} onChange={(e)=>onChange('areaConstruccion', Number(e.target.value))} />
  <SelectField label='Habitaciones' value={String(value.habitaciones ?? '')} onChange={(val)=>onChange('habitaciones', val)} options={['1', '2', '3', '4', '5', '6+']} />
  <SelectField label='Baños' value={String(value.banos ?? '')} onChange={(val)=>onChange('banos', val)} options={['1', '2', '3', '4', '5+']} />
  <SelectField label='Niveles' value={String(value.niveles ?? '')} onChange={(val)=>onChange('niveles', val)} options={['1', '2', '3', '4+']} />
  <SelectField label='Estado' value={String(value.estadoConstruccion ?? '')} onChange={(val)=>onChange('estadoConstruccion', val)} options={['Excelente', 'Bueno', 'Regular', 'Malo']} />
  <SelectField label='Acabados' value={String(value.acabados ?? '')} onChange={(val)=>onChange('acabados', val)} options={['Premium', 'Alto', 'Medio', 'Básico']} />
  <SelectField label='Tipo construcción' value={String(value.tipoConstruccion ?? '')} onChange={(val)=>onChange('tipoConstruccion', val)} options={['Lujo moderno', 'Residencial alta', 'Residencial media', 'Económica']} />
</BaseForm>;

export const FincaForm = ({ value, onChange, onSubmit, loading }: Omit<Props, 'title'|'children'>) => <BaseForm value={value} onChange={onChange} onSubmit={onSubmit} loading={loading} title='Ficha técnica rural · Finca'>
  <input type='number' className={inputClass} placeholder='Extensión manzanas' value={String(value.extensionManzanas ?? '')} onChange={(e)=>onChange('extensionManzanas', Number(e.target.value))} />
  <SelectField label='Uso principal' value={String(value.usoPrincipal ?? '')} onChange={(val)=>onChange('usoPrincipal', val)} options={['Ganadera', 'Agrícola', 'Cafetalera', 'Forestal', 'Turística']} />
  <SelectField label='Topografía' value={String(value.topografia ?? '')} onChange={(val)=>onChange('topografia', val)} options={['Plano', 'Semi plano', 'Inclinado', 'Quebrado']} />
  <SelectField label='Acceso' value={String(value.acceso ?? '')} onChange={(val)=>onChange('acceso', val)} options={['Todo tiempo', 'Estacional']} />
</BaseForm>;

export const QuintaForm = ({ value, onChange, onSubmit, loading }: Omit<Props, 'title'|'children'>) => <BaseForm value={value} onChange={onChange} onSubmit={onSubmit} loading={loading} title='Ficha técnica recreacional · Quinta'>
  <input type='number' className={inputClass} placeholder='Área total m²' value={String(value.areaTotal ?? '')} onChange={(e)=>onChange('areaTotal', Number(e.target.value))} />
  <input type='number' className={inputClass} placeholder='Área construcción m²' value={String(value.construccion ?? '')} onChange={(e)=>onChange('construccion', Number(e.target.value))} />
  <CheckboxGroup title='Amenidades' options={[{ key: 'piscina', label: 'Piscina' }, { key: 'rancho', label: 'Rancho' }, { key: 'jardines', label: 'Jardines' }, { key: 'areaRecreativa', label: 'Área recreativa' }]} value={value} onChange={onChange} />
</BaseForm>;

export const BodegaForm = ({ value, onChange, onSubmit, loading }: Omit<Props, 'title'|'children'>) => <BaseForm value={value} onChange={onChange} onSubmit={onSubmit} loading={loading} title='Ficha técnica industrial · Bodega'>
  <input type='number' className={inputClass} placeholder='Área construcción m²' value={String(value.areaConstruccion ?? '')} onChange={(e)=>onChange('areaConstruccion', Number(e.target.value))} />
  <input type='number' className={inputClass} placeholder='Altura (m)' value={String(value.altura ?? '')} onChange={(e)=>onChange('altura', Number(e.target.value))} />
  <ToggleField label='Andén carga' checked={Boolean(value.andenCarga)} onChange={(checked)=>onChange('andenCarga', checked)} />
  <ToggleField label='Energía trifásica' checked={Boolean(value.trifasica)} onChange={(checked)=>onChange('trifasica', checked)} />
  <ToggleField label='Seguridad' checked={Boolean(value.seguridad)} onChange={(checked)=>onChange('seguridad', checked)} />
  <ToggleField label='Oficinas' checked={Boolean(value.oficinas)} onChange={(checked)=>onChange('oficinas', checked)} />
</BaseForm>;

export const ComercialForm = ({ value, onChange, onSubmit, loading }: Omit<Props, 'title'|'children'>) => <BaseForm value={value} onChange={onChange} onSubmit={onSubmit} loading={loading} title='Ficha técnica comercial · Local'>
  <input type='number' className={inputClass} placeholder='Área construcción m²' value={String(value.areaConstruccion ?? '')} onChange={(e)=>onChange('areaConstruccion', Number(e.target.value))} />
  <SelectField label='Flujo comercial' value={String(value.flujoComercial ?? '')} onChange={(val)=>onChange('flujoComercial', val)} options={['Alto', 'Medio', 'Bajo']} />
  <SelectField label='Visibilidad' value={String(value.visibilidad ?? '')} onChange={(val)=>onChange('visibilidad', val)} options={['Excelente', 'Buena', 'Regular']} />
</BaseForm>;
