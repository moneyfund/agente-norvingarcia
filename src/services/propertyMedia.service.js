import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { db, firebaseConfig, storage } from '../firebase/config';
import { assertAllowedAdmin } from './adminAuth';

const propiedadesCollection = 'propiedades';
const UPLOAD_STALL_TIMEOUT_MS = 60_000;


function assertCurrentUserCanUpload() {
  assertAllowedAdmin();
}

function sanitizeFilename(fileName = '') {
  return fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
}

function assertUploadContext(propertyId, file) {
  if (!propertyId || typeof propertyId !== 'string') {
    throw new Error('No se pudo subir el archivo: propertyId inválido.');
  }

  if (!firebaseConfig.storageBucket) {
    throw new Error('No se pudo subir el archivo: falta VITE_FIREBASE_STORAGE_BUCKET.');
  }

  if (!file) {
    throw new Error('No se pudo subir el archivo: archivo inválido.');
  }
}

function buildStoragePath(propertyId, folder, file) {
  const safeName = sanitizeFilename(file.name);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  return `propiedades/${propertyId}/${folder}/${uniqueName}`;
}

function toReadableUploadError(error) {
  const code = error?.code || '';

  if (code.includes('storage/unauthorized')) {
    return 'Firebase Storage rechazó la subida (storage/unauthorized). Revisa reglas y rol admin.';
  }

  if (code.includes('storage/canceled')) {
    return 'La subida fue cancelada antes de completarse.';
  }

  if (code.includes('storage/retry-limit-exceeded')) {
    return 'Se agotó el tiempo de reintento de Firebase Storage. Revisa conexión y bucket.';
  }

  return error?.message || 'Error desconocido subiendo archivo a Firebase Storage.';
}

function uploadSingleFile({ propertyId, type, file, onProgress }) {
  assertUploadContext(propertyId, file);

  const folder = type === 'video' ? 'videos' : 'imagenes';
  const path = buildStoragePath(propertyId, folder, file);
  const fileRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    let settled = false;
    let lastTransferred = 0;

    const settleReject = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const stallTimer = setInterval(() => {
      const snapshot = task.snapshot;
      if (!snapshot) return;

      if (snapshot.bytesTransferred <= lastTransferred && snapshot.state === 'running') {
        const timeoutError = new Error(
          `La subida quedó sin progreso por más de ${UPLOAD_STALL_TIMEOUT_MS / 1000}s.`,
        );
        timeoutError.code = 'storage/stalled-upload';
        task.cancel();
        clearInterval(stallTimer);
        settleReject(timeoutError);
        return;
      }

      lastTransferred = snapshot.bytesTransferred;
    }, UPLOAD_STALL_TIMEOUT_MS);

    const task = uploadBytesResumable(fileRef, file, {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000',
    });

    task.on(
      'state_changed',
      (snapshot) => {
        if (!onProgress) return;
        const progress = snapshot.totalBytes
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress(progress);
      },
      (rawError) => {
        clearInterval(stallTimer);
        const readableMessage = toReadableUploadError(rawError);
        const uploadError = new Error(readableMessage);
        uploadError.code = rawError?.code || 'storage/upload-failed';
        uploadError.cause = rawError;

        console.error('[Storage] Error subiendo archivo', {
          code: rawError?.code,
          message: rawError?.message,
          propertyId,
          path,
          fileName: file?.name,
          fileType: file?.type,
          fileSize: file?.size,
          bucket: firebaseConfig.storageBucket,
        });

        settleReject(uploadError);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          clearInterval(stallTimer);
          settled = true;
          resolve({
            type,
            url,
            path,
            name: file.name,
            createdAt: Date.now(),
          });
        } catch (error) {
          clearInterval(stallTimer);
          settleReject(error);
        }
      },
    );
  });
}

async function uploadPropertyMedia(propertyId, files, type, onFileProgress) {
  if (!Array.isArray(files) || !files.length) return [];

  assertCurrentUserCanUpload();

  const uploadJobs = files.map((file, index) => uploadSingleFile({
    propertyId,
    type,
    file,
    onProgress: (progress) => onFileProgress?.(index, progress),
  }));

  return Promise.all(uploadJobs);
}

export async function uploadPropertyImages(propertyId, files, onFileProgress) {
  return uploadPropertyMedia(propertyId, files, 'image', onFileProgress);
}

export async function uploadPropertyVideos(propertyId, files, onFileProgress) {
  return uploadPropertyMedia(propertyId, files, 'video', onFileProgress);
}

export async function deletePropertyMediaItem(mediaItem) {
  if (!mediaItem?.path) return;
  const mediaRef = ref(storage, mediaItem.path);
  await deleteObject(mediaRef);
}

export async function syncPropertyMedia(propertyId, media) {
  const normalized = media.map((item, index) => ({
    type: item.type === 'video' ? 'video' : 'image',
    url: item.url,
    path: item.path || '',
    name: item.name || '',
    order: index,
    createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
  }));

  await updateDoc(doc(db, propiedadesCollection, propertyId), {
    media: normalized,
    imagenes: normalized.filter((item) => item.type === 'image').map((item) => item.url),
    updatedAt: serverTimestamp(),
  });
}

export async function reorderPropertyMedia(propertyId, media) {
  await syncPropertyMedia(propertyId, media);
}

export async function getPropertyMediaDownloadURL(path) {
  if (!path) return null;
  return getDownloadURL(ref(storage, path));
}
