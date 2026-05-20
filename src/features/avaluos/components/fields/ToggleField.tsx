export function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className='flex h-11 items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100'>{label}<input type='checkbox' checked={checked} onChange={(e)=>onChange(e.target.checked)} /></label>;
}
