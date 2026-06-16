import { createRoot } from 'react-dom/client';
import AvaluoPdfTemplate from '../components/avaluos/AvaluoPdfTemplate';

const IMAGE_TIMEOUT_MS = 8000;
const HTML2CANVAS_TIMEOUT_MS = 30000;
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const slug = (value: string) => String(value || 'sin-titulo').replace(/[^a-z0-9áéíóúñ]+/gi, '-').replace(/^-|-$/g, '');

const withTimeout = async <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export async function loadImageAsBase64(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

  try {
    const response = await fetch(url, { mode: 'cors', signal: controller.signal });
    if (!response.ok) throw new Error(`No se pudo cargar la imagen: ${response.status}`);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

const asBase64IfPossible = async (url?: string) => {
  if (!url || url.startsWith('data:')) return url || '';
  try {
    return await withTimeout(loadImageAsBase64(url), IMAGE_TIMEOUT_MS, 'Tiempo agotado cargando imagen para PDF.');
  } catch (error) {
    console.warn('No se pudo preparar una imagen para el PDF. Se usará placeholder.', { url, error });
    return '';
  }
};

const prepareAvaluoImagesForPdf = async (avaluo: any) => ({
  ...avaluo,
  imagenPrincipalUrl: await asBase64IfPossible(avaluo?.imagenPrincipalUrl),
  imagenesAdicionales: await Promise.all((avaluo?.imagenesAdicionales || []).map(asBase64IfPossible)),
});

const waitForImage = async (img: HTMLImageElement) => {
  if (img.complete && img.naturalWidth > 0) return;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
      resolve();
    };
    const timeoutId = setTimeout(() => {
      img.src = TRANSPARENT_PIXEL;
      finish();
    }, IMAGE_TIMEOUT_MS);

    img.onload = finish;
    img.onerror = () => {
      img.src = TRANSPARENT_PIXEL;
      finish();
    };
  });

  if ('decode' in img && img.naturalWidth > 0) {
    try {
      await withTimeout(img.decode(), IMAGE_TIMEOUT_MS, 'Tiempo agotado decodificando imagen para PDF.');
    } catch {
      img.src = TRANSPARENT_PIXEL;
    }
  }
};

const waitForImages = async (container: HTMLElement) => {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(images.map(waitForImage));
};

const renderTemplate = async (root: ReturnType<typeof createRoot>, host: HTMLElement, avaluo: any) => {
  root.render(<AvaluoPdfTemplate avaluo={avaluo} />);
  await nextFrame();
  await nextFrame();
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
    if (!host.isConnected || !pages.length) throw new Error('No se encontró el template para generar el PDF.');

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

    const pageImages: string[] = [];
    for (const page of pages) {
      const canvas = await withTimeout(
        html2canvas(page, canvasOptions),
        HTML2CANVAS_TIMEOUT_MS,
        'Tiempo agotado generando el canvas del PDF.',
      );
      pageImages.push(canvas.toDataURL('image/png'));
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    pageImages.forEach((imgData, index) => {
      if (index > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    });

    pdf.save(`Informe-Avaluo-${slug(preparedAvaluo?.titulo || preparedAvaluo?.id)}.pdf`);
  } finally {
    root.unmount();
    if (host.parentNode) host.parentNode.removeChild(host);
  }
}
