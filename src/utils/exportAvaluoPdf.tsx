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
  host.style.position = 'fixed'; host.style.left = '-10000px'; host.style.top = '0'; host.style.width = '900px'; host.style.background = '#fff';
  document.body.appendChild(host);
  const root = createRoot(host);
  root.render(<AvaluoPdfTemplate avaluo={avaluo} />);
  await new Promise((resolve) => setTimeout(resolve, 700));
  const pages = Array.from(host.querySelectorAll('.avaluo-pdf-page')) as HTMLElement[];
  const pdf = new jsPDF('p', 'mm', 'a4');
  for (let i = 0; i < pages.length; i += 1) {
    const canvas = await html2canvas(pages[i], { scale: 2.5, useCORS: true, allowTaint: false, backgroundColor: '#ffffff' });
    const img = canvas.toDataURL('image/jpeg', 0.95);
    if (i > 0) pdf.addPage();
    pdf.addImage(img, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }
  pdf.save(`Informe-Avaluo-${slug(avaluo?.titulo || avaluo?.id)}.pdf`);
  root.unmount();
  document.body.removeChild(host);
}
