const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'];

function isVideoUrl(url = '') {
  const normalized = String(url).toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => normalized.includes(ext));
}

function normalizeMediaItem(item = {}, fallbackOrder = 0) {
  if (!item?.url || !item?.type) return null;

  const source = item.source === 'storage' || item.source === 'url'
    ? item.source
    : item.path
      ? 'storage'
      : 'url';

  return {
    type: item.type === 'video' ? 'video' : 'image',
    source,
    url: item.url,
    path: source === 'storage' ? item.path || null : null,
    name: item.name || '',
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : fallbackOrder,
    createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
  };
}

export function buildLegacyMedia(data = {}) {
  const legacyImages = Array.isArray(data.imagenes)
    ? data.imagenes
    : Array.isArray(data.images)
      ? data.images
      : Array.isArray(data.imageUrls)
        ? data.imageUrls
        : typeof data.imagen === 'string' && data.imagen.trim()
          ? [data.imagen.trim()]
          : typeof data.image === 'string' && data.image.trim()
            ? [data.image.trim()]
            : [];

  const videos = Array.isArray(data.videos) ? data.videos : [];

  const imageItems = legacyImages
    .map((url, index) => ({
      type: isVideoUrl(url) ? 'video' : 'image',
      source: 'url',
      url,
      path: null,
      name: '',
      order: index,
      createdAt: Date.now(),
    }))
    .filter((item) => !!item.url);

  const videoItems = videos
    .map((url, index) => ({
      type: 'video',
      source: 'url',
      url,
      path: null,
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
