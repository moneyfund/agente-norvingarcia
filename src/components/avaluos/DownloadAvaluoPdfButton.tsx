import { useState } from 'react';
import { Download, Eye, EyeOff } from 'lucide-react';
import { exportAvaluoToPdf } from '../../utils/exportAvaluoPdf';
import AvaluoPdfTemplate from './AvaluoPdfTemplate';

export default function DownloadAvaluoPdfButton({ avaluo, className = '' }: { avaluo: any, className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const handleClick = async () => {
    if (loading) return;
    setLoading(true); setError('');
    try { await exportAvaluoToPdf(avaluo); }
    catch (err: any) { setError(err?.message?.includes('html2canvas') || err?.message?.includes('jspdf') ? 'No se pudo cargar la librería PDF. Revisa la instalación de html2canvas y jsPDF.' : 'No se pudo generar el PDF.'); }
    finally { setLoading(false); }
  };
  return <div className='flex flex-col gap-2'>
    <div className='inline-flex flex-wrap gap-2'>
      <button type='button' onClick={handleClick} disabled={loading} className={`inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60 ${className}`}><Download size={18}/>{loading ? 'Generando PDF...' : 'Descargar PDF'}</button>
      <button type='button' onClick={() => setShowPreview((value) => !value)} className='inline-flex items-center gap-2 rounded-xl border border-amber-400/70 bg-slate-900/70 px-4 py-2 font-semibold text-amber-100 hover:bg-slate-800'>
        {showPreview ? <EyeOff size={18}/> : <Eye size={18}/>}{showPreview ? 'Ocultar vista PDF' : 'Vista previa PDF'}
      </button>
    </div>
    {error && <span className='text-xs text-red-300'>{error}</span>}
    {showPreview && <div className='avaluo-pdf-preview-panel'><AvaluoPdfTemplate avaluo={avaluo} /></div>}
  </div>;
}
