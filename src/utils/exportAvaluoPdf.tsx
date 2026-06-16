import { createRoot } from 'react-dom/client';
import AvaluoPdfTemplate from '../components/avaluos/AvaluoPdfTemplate';

const slug = (value: string) => String(value || 'sin-titulo').replace(/[^a-z0-9áéíóúñ]+/gi, '-').replace(/^-|-$/g, '');

export async function exportAvaluoToPdf(avaluo: any) {
  const load = async (pkg: string, cdn: string) => {
    try { return await import(/* @vite-ignore */ pkg); }
    catch { return import(/* @vite-ignore */ cdn); }
  };
  const [{ default: html2canvas }, jsPdfModule] = await Promise.all([
    load('html2canvas', 'https://esm.sh/html2canvas@1.4.1'),
    load('jspdf', 'https://esm.sh/jspdf@2.5.2'),
  ]);
  const jsPDF = jsPdfModule.default || jsPdfModule.jsPDF;
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-9999px';
  host.style.top = '0';
  host.style.width = '794px';
  host.style.background = '#ffffff';
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    root.render(<AvaluoPdfTemplate avaluo={avaluo} />);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const pages = Array.from(host.querySelectorAll('.avaluo-pdf-page')) as HTMLElement[];
    if (!pages.length) throw new Error('No se encontraron páginas para generar el PDF.');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;

    for (let i = 0; i < pages.length; i += 1) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123,
      });
      const imgData = canvas.toDataURL('image/png');
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`Informe-Avaluo-${slug(avaluo?.titulo || avaluo?.id)}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}
