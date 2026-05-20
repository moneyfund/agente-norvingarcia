import { inputClass } from '../../forms/shared';

export function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <select className={inputClass} value={value} onChange={(e)=>onChange(e.target.value)}><option value=''>{label}</option>{options.map((option)=><option key={option} value={option}>{option}</option>)}</select>;
}
