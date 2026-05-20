export function RadioGroup({ name, options, value, onChange }: { name: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <div className='md:col-span-2 flex flex-wrap gap-2'>{options.map((option)=><label key={option} className='rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-200'><input type='radio' className='mr-2' name={name} checked={value === option} onChange={()=>onChange(option)} />{option}</label>)}</div>;
}
