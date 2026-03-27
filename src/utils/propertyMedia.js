const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'];

function isVideoUrl(url = '') {
  const normalized = String(url).toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => normalized.includes(ext));
}

function normalizeMediaItem(item = {}, fallbackOrder = 0) {
  if (!item?.url || !item?.type) return null;

  return {
    type: item.type === 'video' ? 'video' : 'image',
    url: item.url,
    path: item.path || '',
    name: item.name || '',
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : fallbackOrder,
    createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
  };
}

export function buildLegacyMedia(data = {}) {
  const images = Array.isArray(data.imagenes)
    ? data.imagenes
    : typeof data.imagen === 'string' && data.imagen.trim()
      ? [data.imagen.trim()]
      : [];

  const videos = Array.isArray(data.videos) ? data.videos : [];

  const imageItems = images
    .map((url, index) => ({
      type: isVideoUrl(url) ? 'video' : 'image',
      url,
      path: '',
      name: '',
      order: index,
      createdAt: Date.now(),
    }))
    .filter((item) => !!item.url);

  const videoItems = videos
    .map((url, index) => ({
      type: 'video',
      url,
      path: '',
      name: '',
      order: imageItems.length + index,
      createdAt: Date.now(),
    }))
    .filter((item) => !!item.url);

  return [...imageItems, ...videoItems];
}

export function normalizePropertyMedia(data = {}) {
  if (Array.isArray(data.media) && data.media.length) {
    return data.media
      .map((item, index) => normalizeMediaItem(item, index))
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({ ...item, order: index }));
  }

  return buildLegacyMedia(data);
}

export function getPrimaryImageUrl(property = {}) {
  const media = normalizePropertyMedia(property);
  const firstImage = media.find((item) => item.type === 'image');
  return firstImage?.url || media[0]?.url || '';
}
