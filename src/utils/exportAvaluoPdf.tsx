import { createRoot } from 'react-dom/client';
import AvaluoPdfTemplate from '../components/avaluos/AvaluoPdfTemplate';

const slug = (value: string) => String(value || 'sin-titulo').replace(/[^a-z0-9áéíóúñ]+/gi, '-').replace(/^-|-$/g, '');

export async function loadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) throw new Error(`No se pudo cargar la imagen: ${response.status}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const asBase64IfPossible = async (url?: string) => {
  if (!url || url.startsWith('data:')) return url || '';
  try { return await loadImageAsBase64(url); }
  catch { return url; }
};

const prepareAvaluoImagesForPdf = async (avaluo: any) => ({
  ...avaluo,
  imagenPrincipalUrl: await asBase64IfPossible(avaluo?.imagenPrincipalUrl),
  imagenesAdicionales: await Promise.all((avaluo?.imagenesAdicionales || []).map(asBase64IfPossible)),
});

const waitForImages = async (container: HTMLElement) => {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(images.map(async (img) => {
    if (img.complete && img.naturalWidth > 0) return;
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
    if ('decode' in img && img.naturalWidth > 0) {
      try { await img.decode(); }
      catch { /* La imagen ya disparó load; continuar con el render del PDF. */ }
    }
  }));
};

const renderTemplate = async (root: ReturnType<typeof createRoot>, host: HTMLElement, avaluo: any) => {
  root.render(<AvaluoPdfTemplate avaluo={avaluo} />);
  await new Promise((resolve) => setTimeout(resolve, 700));
  await waitForImages(host);
};

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
    const preparedAvaluo = await prepareAvaluoImagesForPdf(avaluo);
    await renderTemplate(root, host, preparedAvaluo);
    const pages = Array.from(host.querySelectorAll('.avaluo-pdf-page')) as HTMLElement[];
    if (!pages.length) throw new Error('No se encontraron páginas para generar el PDF.');

    const pdfWidth = 210;
    const pdfHeight = 297;

    const canvasOptions = {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      windowHeight: 1123,
    };

    const renderPagesToImages = async () => {
      const pageImages: string[] = [];
      for (let i = 0; i < pages.length; i += 1) {
        const canvas = await html2canvas(pages[i], canvasOptions);
        pageImages.push(canvas.toDataURL('image/png'));
      }
      return pageImages;
    };

    let pageImages: string[];
    try {
      pageImages = await renderPagesToImages();
    } catch (error) {
      await renderTemplate(root, host, preparedAvaluo);
      pages.splice(0, pages.length, ...(Array.from(host.querySelectorAll('.avaluo-pdf-page')) as HTMLElement[]));
      pageImages = await renderPagesToImages();
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    pageImages.forEach((imgData, index) => {
      if (index > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    });

    pdf.save(`Informe-Avaluo-${slug(preparedAvaluo?.titulo || preparedAvaluo?.id)}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}
