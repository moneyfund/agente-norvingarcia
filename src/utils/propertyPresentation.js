import legacyPhotos from '../config/legacyPropertyPhotos.json';
import { normalizePropertyMedia } from './propertyMedia';

const currency = new Intl.NumberFormat('es-NI', { maximumFractionDigits: 0 });
const legacyOrigin = 'https://i.imgur.com/';

function legacyPhoto(url) {
  if (typeof url !== 'string' || !url.startsWith(legacyOrigin)) return null;
  const filename = url.slice(legacyOrigin.length).split(/[?#]/, 1)[0];
  return Object.hasOwn(legacyPhotos, filename) ? legacyPhotos[filename] : null;
}

export function optimizedPropertyPhoto(url) {
  return legacyPhoto(url)?.src || url;
}

export function propertyThumbnail(url) {
  const thumb = legacyPhoto(url)?.thumb;
  if (!thumb) return null;
  const [src, index, count] = thumb;
  return {
    backgroundImage: `url("${src}")`,
    backgroundSize: `${count * 100}% 100%`,
    backgroundPosition: `${count > 1 ? index * 100 / (count - 1) : 0}% 50%`,
  };
}

export function propertyCover(property) {
  const image = normalizePropertyMedia(property).find(({ type }) => type === 'image');
  return optimizedPropertyPhoto(image?.url) || '/img/placeholder-property.svg';
}

export const formatUSD = (value) => {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) {
    return 'Precio a consultar';
  }
  return `US$ ${currency.format(Number(value))}`;
};

export const isPositiveNumber = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

export const operationLabel = (property) => (
  property.tipoOperacion === 'alquiler' ? 'En alquiler' : 'En venta'
);

const units = {
  varas: ['v²', 'vara cuadrada'],
  metros: ['m²', 'metro cuadrado'],
  manzanas: ['mz', 'manzana'],
};

export function propertyUnit(unit = 'varas') {
  const [short, long] = units[unit] || [unit, 'unidad'];
  return { short, long };
}

export function pricePerArea(property) {
  if (isPositiveNumber(property.precioPorArea)) return Number(property.precioPorArea);
  if (isPositiveNumber(property.area) && isPositiveNumber(property.precio)) {
    return Number(property.precio) / Number(property.area);
  }
  return null;
}

export function applyImageFallback(event) {
  const image = event.currentTarget;
  if (!image.src.endsWith('/img/placeholder-property.svg')) {
    image.src = '/img/placeholder-property.svg';
  }
}
