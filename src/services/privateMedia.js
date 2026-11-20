import { getBlob, ref } from 'firebase/storage';
import { storage } from '../firebase/config';
import { assertAllowedAdmin } from './adminAuth';

const privateFolder = /^(avaluos|listado)\//;
const imageData = /^data:image\/(jpeg|png|webp|gif);base64,/i;
const maxBytes = 10 * 1024 * 1024;

async function imageBlob(source) {
  const object = ref(storage, source);
  if (object.bucket !== storage.app.options.storageBucket || !privateFolder.test(object.fullPath)) {
    throw new Error('Archivo fuera del directorio privado.');
  }
  return getBlob(object, maxBytes);
}

export async function readPrivateImage(source) {
  assertAllowedAdmin();
  if (!source || typeof source !== 'string') return '';
  if (imageData.test(source)) return source;

  let blob;
  if (privateFolder.test(source) || source.startsWith('gs://')) {
    blob = await imageBlob(source);
  } else {
    const url = new URL(source);
    if (url.protocol !== 'https:') throw new Error('Referencia de imagen no válida.');
    if (url.hostname === 'firebasestorage.googleapis.com' || url.hostname === 'storage.googleapis.com') {
      // Old records contain token URLs. The SDK resolves their object path and authorizes a fresh read.
      blob = await imageBlob(source);
    } else {
      // Older reports can reference images originally hosted outside Firebase.
      const response = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
      if (!response.ok) throw new Error('Imagen externa no disponible.');
      blob = await response.blob();
    }
  }
  if (blob.size > maxBytes || !/^image\/(jpeg|jpg|png|webp|gif)$/i.test(blob.type)) {
    throw new Error('La imagen no tiene un formato o tamaño compatible.');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(blob);
  });
}
