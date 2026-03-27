import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { db, storage } from '../firebase/config';

const propiedadesCollection = 'propiedades';

function sanitizeFilename(fileName = '') {
  return fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
}

function buildStoragePath(propertyId, folder, file) {
  const safeName = sanitizeFilename(file.name);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  return `propiedades/${propertyId}/${folder}/${uniqueName}`;
}

function uploadSingleFile({ propertyId, type, file, onProgress }) {
  const folder = type === 'video' ? 'videos' : 'imagenes';
  const path = buildStoragePath(propertyId, folder, file);
  const fileRef = ref(storage, path);

  return new Promise((resolve, reject) => {
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
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({
            type,
            url,
            path,
            name: file.name,
            createdAt: Date.now(),
          });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

async function uploadPropertyMedia(propertyId, files, type, onFileProgress) {
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
