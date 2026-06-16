import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase/config.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_WIDTH = 1800;
const QUALITY = 0.82;

export const isValidAvaluoImage = (file: File) => ALLOWED_IMAGE_TYPES.includes(file.type);

const safeName = (name: string) => `${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')}`;

const optimizeImage = async (file: File): Promise<Blob> => {
  if (!file.type.startsWith('image/') || typeof document === 'undefined') return file;
  try {
    const img = new Image();
    const url = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    const scale = Math.min(1, MAX_WIDTH / img.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    return await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob || file), file.type === 'image/png' ? 'image/png' : 'image/jpeg', QUALITY));
  } catch {
    return file;
  }
};

export const uploadAvaluoImage = async (file: File, avaluoId: string): Promise<string> => {
  if (!isValidAvaluoImage(file)) throw new Error(`Formato no permitido: ${file.name}`);
  const blob = await optimizeImage(file);
  const imageRef = ref(storage, `avaluos/${avaluoId}/principal/${safeName(file.name)}`);
  await uploadBytes(imageRef, blob, { contentType: file.type });
  return getDownloadURL(imageRef);
};

export const uploadAvaluoGallery = async (files: File[], avaluoId: string): Promise<string[]> => {
  const selected = files.slice(0, 5).filter(isValidAvaluoImage);
  const results = await Promise.allSettled(selected.map(async (file) => {
    const blob = await optimizeImage(file);
    const imageRef = ref(storage, `avaluos/${avaluoId}/galeria/${safeName(file.name)}`);
    await uploadBytes(imageRef, blob, { contentType: file.type });
    return getDownloadURL(imageRef);
  }));
  return results.filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled').map((r) => r.value);
};
