const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido.' });
    return;
  }

  const { url } = req.query || {};
  const imageUrl = Array.isArray(url) ? url[0] : url;

  if (!imageUrl || !isValidHttpUrl(imageUrl)) {
    res.status(400).json({ error: 'Parámetro url inválido.' });
    return;
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      res.status(response.status).json({ error: `No se pudo descargar la imagen (${response.status}).` });
      return;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      res.status(415).json({ error: 'La URL no corresponde a una imagen.' });
      return;
    }

    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_IMAGE_BYTES) {
      res.status(413).json({ error: 'La imagen excede el tamaño máximo permitido.' });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      res.status(413).json({ error: 'La imagen excede el tamaño máximo permitido.' });
      return;
    }

    const base64 = Buffer.from(arrayBuffer).toString('base64');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({ dataUrl: `data:${contentType};base64,${base64}` });
  } catch (error) {
    console.error('Error en image-proxy:', error);
    res.status(500).json({ error: 'No se pudo convertir la imagen.' });
  }
}
