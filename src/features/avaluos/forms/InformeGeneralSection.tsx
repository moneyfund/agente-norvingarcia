const base = 'rounded-xl border border-slate-700 bg-slate-900 p-3';
const accept = 'image/jpeg,image/jpg,image/png,image/webp';

export default function InformeGeneralSection({ value, onChange }: { value: any; onChange: (key: string, value: any) => void }) {
  const selectedGallery = value.imagenesAdicionalesFiles || [];
  const handleGallery = (files: File[]) => onChange('imagenesAdicionalesFiles', files.slice(0, 5));

  return <div className='mb-5 rounded-2xl border border-amber-500/30 bg-slate-950/70 p-4'>
    <h3 className='text-lg font-semibold text-amber-100'>Datos generales para informe PDF</h3>
    <p className='mt-1 text-sm text-slate-300'>Estos datos se guardan en Firestore y se usan para generar el informe profesional descargable.</p>
    <div className='mt-4 grid gap-4 md:grid-cols-2'>
      <label className={base}><span>Nombre del agente evaluador *</span><input className='mt-2 w-full rounded bg-slate-800 p-2' value={value.agenteEvaluador || ''} onChange={e => onChange('agenteEvaluador', e.target.value)} /></label>
      <label className={base}><span>Teléfono del agente (opcional)</span><input className='mt-2 w-full rounded bg-slate-800 p-2' value={value.telefonoAgente || ''} onChange={e => onChange('telefonoAgente', e.target.value)} /></label>
      <label className={base}><span>Imagen principal de la propiedad</span><input type='file' accept={accept} className='mt-2 w-full rounded bg-slate-800 p-2 text-sm' onChange={e => onChange('imagenPrincipalFile', e.target.files?.[0] || null)} /><small className='text-slate-400'>Recomendado. JPG, JPEG, PNG o WEBP. Máximo 10 MB.</small></label>
      <label className={base}><span>Fotografías adicionales (máximo 5)</span><input type='file' accept={accept} multiple className='mt-2 w-full rounded bg-slate-800 p-2 text-sm' onChange={e => handleGallery(Array.from(e.target.files || []))} /><small className='text-slate-400'>{selectedGallery.length}/5 seleccionadas. Cada imagen debe pesar máximo 10 MB.</small></label>
    </div>
  </div>;
}
