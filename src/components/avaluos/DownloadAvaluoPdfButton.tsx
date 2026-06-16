import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportAvaluoToPdf } from '../../utils/exportAvaluoPdf';

export default function DownloadAvaluoPdfButton({ avaluo, className = '' }: { avaluo: any, className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleClick = async () => {
    if (loading) return;
    setLoading(true); setError('');
    try { await exportAvaluoToPdf(avaluo); }
    catch (err: any) { setError(err?.message?.includes('html2canvas') || err?.message?.includes('jspdf') ? 'No se pudo cargar la librería PDF. Revisa la instalación de html2canvas y jsPDF.' : 'No se pudo generar el PDF.'); }
    finally { setLoading(false); }
  };
  return <div className='inline-flex flex-col gap-1'><button type='button' onClick={handleClick} disabled={loading} className={`inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60 ${className}`}><Download size={18}/>{loading ? 'Generando PDF...' : 'Descargar PDF'}</button>{error && <span className='text-xs text-red-300'>{error}</span>}</div>;
}
