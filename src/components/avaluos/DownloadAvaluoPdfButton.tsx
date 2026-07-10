import { useEffect, useState } from 'react';
import { Download, Eye, EyeOff } from 'lucide-react';
import { exportAvaluoToPdf } from '../../utils/exportAvaluoPdf';
import AvaluoPdfTemplate from './AvaluoPdfTemplate';
import HouseReportPDF from './HouseReportPDF';
import { imageUrlToDataUrlViaProxy } from '../../utils/imageProxy';

export default function DownloadAvaluoPdfButton({ avaluo, className = '' }: { avaluo: any, className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewAvaluo, setPreviewAvaluo] = useState(avaluo);

  useEffect(() => {
    let cancelled = false;

    const preparePreviewImage = async () => {
      setPreviewAvaluo({
        ...avaluo,
        imagenPrincipalBase64: avaluo?.imagenPrincipalBase64 || '',
        imagenesAdicionalesBase64: avaluo?.imagenesAdicionalesBase64 || [],
      });

      try {
        const [imagenPrincipalBase64, imagenesAdicionalesBase64] = await Promise.all([
          imageUrlToDataUrlViaProxy(avaluo?.imagenPrincipalUrl || avaluo?.imagenPrincipal),
          Promise.all((avaluo?.imagenesAdicionales || avaluo?.imagenes || []).slice(0, 5).map((url: string) => imageUrlToDataUrlViaProxy(url).catch(() => ''))),
        ]);

        if (!cancelled) {
          setPreviewAvaluo({
            ...avaluo,
            imagenPrincipalBase64,
            imagenesAdicionalesBase64: imagenesAdicionalesBase64.filter(Boolean),
          });
        }
      } catch (err) {
        console.warn('No se pudo preparar la imagen de vista previa del PDF. Se usará placeholder.', err);
        if (!cancelled) {
          setPreviewAvaluo({
            ...avaluo,
            imagenPrincipalBase64: '',
            imagenesAdicionalesBase64: [],
          });
        }
      }
    };

    if (showPreview) preparePreviewImage();

    return () => {
      cancelled = true;
    };
  }, [avaluo, showPreview]);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true); setError('');
    try { await exportAvaluoToPdf(avaluo); }
    catch (err: any) {
      console.error('Error generando PDF:', err);
      const message = err?.message?.includes('html2canvas') || err?.message?.includes('jspdf') ? 'No se pudo cargar la librería PDF. Revisa la instalación de html2canvas y jsPDF.' : 'No se pudo generar el PDF. Revisa consola.';
      setError(message);
      alert(message);
    }
    finally { setLoading(false); }
  };
  return <div className='flex flex-col gap-2'>
    <div className='inline-flex flex-wrap gap-2'>
      <button type='button' onClick={handleClick} disabled={loading} className={`inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-600 disabled:opacity-60 ${className}`}><Download size={18}/>{loading ? 'Generando PDF...' : 'Descargar PDF'}</button>
      <button type='button' onClick={() => setShowPreview((value) => !value)} className='inline-flex items-center gap-2 rounded-xl border border-red-400/70 bg-slate-900/70 px-4 py-2 font-semibold text-red-100 hover:bg-slate-800'>
        {showPreview ? <EyeOff size={18}/> : <Eye size={18}/>}{showPreview ? 'Ocultar vista PDF' : 'Vista previa PDF'}
      </button>
    </div>
    {error && <span className='text-xs text-red-300'>{error}</span>}
    {showPreview && <div className='avaluo-pdf-preview-panel'>{previewAvaluo?.tipoPropiedad === 'casa' ? <HouseReportPDF avaluo={previewAvaluo} /> : <AvaluoPdfTemplate avaluo={previewAvaluo} />}</div>}
  </div>;
}
