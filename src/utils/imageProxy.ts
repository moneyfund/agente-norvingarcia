const IMAGE_PROXY_TIMEOUT_MS = 10000;

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

export async function imageUrlToDataUrlViaProxy(url?: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  const response = await withTimeout(
    fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`),
    IMAGE_PROXY_TIMEOUT_MS,
    'Tiempo agotado convirtiendo imagen a base64.',
  );

  if (!response.ok) throw new Error(`No se pudo convertir la imagen (${response.status}).`);

  const payload = await response.json();
  if (typeof payload?.dataUrl !== 'string' || !payload.dataUrl.startsWith('data:image/')) {
    throw new Error('El proxy no devolvió una imagen válida.');
  }

  return payload.dataUrl;
}
