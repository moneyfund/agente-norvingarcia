import { createRoot } from 'react-dom/client';
import AvaluoPdfTemplate from '../components/avaluos/AvaluoPdfTemplate';
import HouseReportPDF from '../components/avaluos/HouseReportPDF';
import { imageUrlToDataUrlViaProxy } from './imageProxy';

const IMAGE_TIMEOUT_MS = 8000;
const HTML2CANVAS_TIMEOUT_MS = 30000;
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const PDF_IMAGE_QUALITY = 0.75;
const PDF_IMAGE_MAX_WIDTH = 1600;
const PDF_IMAGE_MAX_HEIGHT = 1200;

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

const compressImageDataUrlForPdf = async (dataUrl?: string) => {
  if (!dataUrl) return '';

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('No se pudo cargar la imagen para comprimirla.'));
      img.src = dataUrl;
    });

    const ratio = Math.min(
      1,
      PDF_IMAGE_MAX_WIDTH / Math.max(img.naturalWidth, 1),
      PDF_IMAGE_MAX_HEIGHT / Math.max(img.naturalHeight, 1),
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));

    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo crear el contexto para comprimir la imagen.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', PDF_IMAGE_QUALITY);
  } catch (error) {
    console.warn('No se pudo comprimir una imagen para el PDF. Se usará placeholder.', error);
    return '';
  }
};

const asBase64IfPossible = async (url?: string) => {
  if (!url) return '';
  try {
    const dataUrl = url.startsWith('data:')
      ? url
      : await withTimeout(imageUrlToDataUrlViaProxy(url), IMAGE_TIMEOUT_MS, 'Tiempo agotado cargando imagen para PDF.');
    return await withTimeout(compressImageDataUrlForPdf(dataUrl), IMAGE_TIMEOUT_MS, 'Tiempo agotado comprimiendo imagen para PDF.');
  } catch (error) {
    console.warn('No se pudo preparar una imagen para el PDF. Se usará placeholder.', { url, error });
    return '';
  }
};

const prepareAvaluoImagesForPdf = async (avaluo: any) => ({
  ...avaluo,
  imagenPrincipalBase64: await asBase64IfPossible((avaluo?.imagenPrincipalUrl || avaluo?.imagenPrincipal)),
  imagenesAdicionalesBase64: await Promise.all(((avaluo?.imagenesAdicionales || avaluo?.imagenes || [])).slice(0, 5).map(asBase64IfPossible)),
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
  root.render(avaluo?.tipoPropiedad === 'casa' ? <HouseReportPDF avaluo={avaluo} /> : <AvaluoPdfTemplate avaluo={avaluo} />);
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

    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
    for (const [index, page] of pages.entries()) {
      const canvas = await withTimeout(
        html2canvas(page, canvasOptions),
        HTML2CANVAS_TIMEOUT_MS,
        'Tiempo agotado generando el canvas del PDF.',
      );
      const imgData = canvas.toDataURL('image/jpeg', PDF_IMAGE_QUALITY);
      if (index > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    pdf.save(`Informe-Avaluo-${slug(preparedAvaluo?.titulo || preparedAvaluo?.id)}.pdf`);
  } finally {
    root.unmount();
    if (host.parentNode) host.parentNode.removeChild(host);
  }
}
