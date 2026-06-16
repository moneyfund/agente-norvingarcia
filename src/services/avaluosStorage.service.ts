import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase/config.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 5;
const MAX_WIDTH = 1800;
const QUALITY = 0.82;

export const isValidAvaluoImage = (file: File) => ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE_BYTES;

const safeName = (name: string) => `${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')}`;

const validateAvaluoImage = (file: File) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Formato no permitido en ${file.name}. Usa JPG, JPEG, PNG o WEBP.`);
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`La imagen ${file.name} supera el máximo de 10 MB.`);
  }
};

export const validateAvaluoGallery = (files: File[]) => {
  if (files.length > MAX_GALLERY_IMAGES) {
    throw new Error(`La galería permite máximo ${MAX_GALLERY_IMAGES} imágenes.`);
  }

  files.forEach(validateAvaluoImage);
};

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

export const uploadAvaluoMainImage = async (file: File, avaluoId: string): Promise<string> => {
  validateAvaluoImage(file);
  const blob = await optimizeImage(file);
  const imageRef = ref(storage, `avaluos/${avaluoId}/principal/${safeName(file.name)}`);
  await uploadBytes(imageRef, blob, { contentType: file.type });
  return getDownloadURL(imageRef);
};

export const uploadAvaluoGalleryImages = async (files: File[], avaluoId: string): Promise<string[]> => {
  validateAvaluoGallery(files);
  const results = await Promise.all(files.map(async (file) => {
    const blob = await optimizeImage(file);
    const imageRef = ref(storage, `avaluos/${avaluoId}/galeria/${safeName(file.name)}`);
    await uploadBytes(imageRef, blob, { contentType: file.type });
    return getDownloadURL(imageRef);
  }));
  return results;
};

export const uploadAvaluoImage = uploadAvaluoMainImage;
export const uploadAvaluoGallery = uploadAvaluoGalleryImages;
