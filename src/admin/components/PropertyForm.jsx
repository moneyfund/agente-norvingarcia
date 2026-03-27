import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Trash2, Upload } from 'lucide-react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../../components/Button';
import { generatePropiedadId } from '../../services/propiedadesService';
import {
  deletePropertyMediaItem,
  uploadPropertyImages,
  uploadPropertyVideos,
} from '../../services/propertyMedia.service';
import { normalizePropertyMedia } from '../../utils/propertyMedia';
import { propertyMarkerIcon } from '../../utils/mapMarkers';

const propertyTypes = ['casa', 'apartamento', 'terreno', 'bodega'];
const operationTypes = [
  { value: 'venta', label: 'Venta' },
  { value: 'alquiler', label: 'Alquiler' },
];
const defaultCenter = [18.4861, -69.9312];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 80 * 1024 * 1024;
const MAX_MEDIA_ITEMS = 20;
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const initialState = {
  titulo: '',
  precio: '',
  tipo: 'casa',
  tipoOperacion: 'venta',
  ubicacion: '',
  descripcion: '',
  habitaciones: 0,
  banos: 0,
  lat: defaultCenter[0],
  lng: defaultCenter[1],
  premium: false,
};

const createExistingMediaItem = (item, index) => ({
  id: `existing-${item.path || item.url || index}`,
  source: 'existing',
  type: item.type,
  url: item.url,
  path: item.path || '',
  name: item.name || `media-${index + 1}`,
  createdAt: item.createdAt || Date.now(),
  order: index,
});


const formatMediaErrorMessage = (error) => {
  const code = error?.code || '';

  if (code.includes('storage/unauthorized')) {
    return 'No tienes permisos para subir archivos. Verifica reglas de Storage y rol admin.';
  }

  if (code.includes('storage/stalled-upload')) {
    return 'La subida se quedó sin progreso y fue cancelada automáticamente. Revisa bucket, reglas y red.';
  }

  return error?.message || 'Error guardando la propiedad.';
};

const buildPendingMediaItem = (file, type) => ({
  id: `pending-${Math.random().toString(36).slice(2, 10)}`,
  source: 'pending',
  type,
  file,
  name: file.name,
  previewUrl: URL.createObjectURL(file),
  progress: 0,
  createdAt: Date.now(),
});

function LocationPicker({ position, onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    },
  });

  return (
    <Marker
      position={position}
      icon={propertyMarkerIcon}
      draggable
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target;
          onSelect(marker.getLatLng());
        },
      }}
    />
  );
}

function PropertyForm({ initialValues, onSubmit, submitLabel = 'Guardar' }) {
  const mergedValues = {
    ...initialState,
    ...initialValues,
    tipoOperacion: initialValues?.tipoOperacion || 'venta',
  };

  const [form, setForm] = useState(mergedValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mediaItems, setMediaItems] = useState(() => normalizePropertyMedia(initialValues || {}).map(createExistingMediaItem));
  const [removedExistingMedia, setRemovedExistingMedia] = useState([]);

  useEffect(() => () => {
    mediaItems.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }, [mediaItems]);

  const mediaCount = mediaItems.length;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const moveMedia = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mediaItems.length) return;

    setMediaItems((prev) => {
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const removeMedia = (itemId) => {
    setMediaItems((prev) => {
      const target = prev.find((item) => item.id === itemId);
      if (!target) return prev;

      if (target.source === 'pending' && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      if (target.source === 'existing') {
        setRemovedExistingMedia((current) => [...current, target]);
      }

      return prev.filter((item) => item.id !== itemId);
    });
  };

  const validateFiles = (files, type) => {
    const acceptedTypes = type === 'image' ? IMAGE_TYPES : VIDEO_TYPES;
    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    const invalidType = files.find((file) => !acceptedTypes.includes(file.type));

    if (invalidType) {
      const label = type === 'image' ? 'imagen' : 'video';
      throw new Error(`El archivo ${invalidType.name} no es un ${label} permitido.`);
    }

    const invalidSize = files.find((file) => file.size > maxSize);
    if (invalidSize) {
      const maxSizeMb = Math.round(maxSize / (1024 * 1024));
      throw new Error(`El archivo ${invalidSize.name} supera el límite de ${maxSizeMb} MB.`);
    }
  };

  const handleFileSelection = (event, type) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      validateFiles(files, type);
      if (mediaItems.length + files.length > MAX_MEDIA_ITEMS) {
        throw new Error(`Solo puedes guardar hasta ${MAX_MEDIA_ITEMS} medios por propiedad.`);
      }

      setMediaItems((prev) => [...prev, ...files.map((file) => buildPendingMediaItem(file, type))]);
      setError('');
    } catch (selectionError) {
      setError(selectionError.message || 'No se pudieron seleccionar los archivos.');
    } finally {
      event.target.value = '';
    }
  };

  const handleMapSelection = ({ lat, lng }) => {
    setForm((prev) => ({
      ...prev,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    }));
  };

  const uploadPendingMedia = async (propertyId) => {
    const pendingImages = mediaItems.filter((item) => item.source === 'pending' && item.type === 'image');
    const pendingVideos = mediaItems.filter((item) => item.source === 'pending' && item.type === 'video');

    const pendingImageResult = pendingImages.length
      ? await uploadPropertyImages(
        propertyId,
        pendingImages.map((item) => item.file),
        (index, progress) => {
          setMediaItems((prev) => prev.map((item) => {
            if (item.id !== pendingImages[index].id) return item;
            return { ...item, progress };
          }));
        },
      )
      : [];

    const pendingVideoResult = pendingVideos.length
      ? await uploadPropertyVideos(
        propertyId,
        pendingVideos.map((item) => item.file),
        (index, progress) => {
          setMediaItems((prev) => prev.map((item) => {
            if (item.id !== pendingVideos[index].id) return item;
            return { ...item, progress };
          }));
        },
      )
      : [];

    const imageByPendingId = new Map(pendingImages.map((item, index) => [item.id, pendingImageResult[index]]));
    const videoByPendingId = new Map(pendingVideos.map((item, index) => [item.id, pendingVideoResult[index]]));

    return mediaItems
      .map((item) => {
        if (item.source === 'existing') {
          return {
            type: item.type,
            url: item.url,
            path: item.path || '',
            name: item.name || '',
            createdAt: item.createdAt || Date.now(),
          };
        }

        const uploadedItem = item.type === 'image' ? imageByPendingId.get(item.id) : videoByPendingId.get(item.id);
        return uploadedItem || null;
      })
      .filter(Boolean)
      .map((item, index) => ({ ...item, order: index }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!form.titulo || !form.ubicacion || !form.descripcion || !form.precio) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    const propertyId = initialValues?.id || generatePropiedadId();

    try {
      setLoading(true);
      const uploadedMedia = await uploadPendingMedia(propertyId);

      await Promise.all(
        removedExistingMedia.map((item) => deletePropertyMediaItem(item).catch(() => null)),
      );

      const payload = {
        id: propertyId,
        ...form,
        precio: Number(form.precio),
        habitaciones: Number(form.habitaciones),
        banos: Number(form.banos),
        lat: Number(form.lat),
        lng: Number(form.lng),
        media: uploadedMedia,
        imagenes: uploadedMedia.filter((item) => item.type === 'image').map((item) => item.url),
      };

      await onSubmit(payload);
      setRemovedExistingMedia([]);
      setSuccessMessage('Propiedad guardada correctamente con medios en Firebase Storage.');

      if (!initialValues) {
        setForm(initialState);
        setMediaItems([]);
      }
    } catch (submitError) {
      console.error('[Admin][PropertyForm] Error en submit de propiedad', submitError);
      setError(formatMediaErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  const markerPosition = [Number(form.lat) || defaultCenter[0], Number(form.lng) || defaultCenter[1]];

  const mediaSummary = useMemo(() => {
    const images = mediaItems.filter((item) => item.type === 'image').length;
    const videos = mediaItems.filter((item) => item.type === 'video').length;
    return { images, videos };
  }, [mediaItems]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título" className="rounded-xl border p-3" required />
        <input name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="Precio" className="rounded-xl border p-3" required />
        <select name="tipo" value={form.tipo} onChange={handleChange} className="rounded-xl border p-3">
          {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <select name="tipoOperacion" value={form.tipoOperacion} onChange={handleChange} className="rounded-xl border p-3">
          {operationTypes.map((operation) => <option key={operation.value} value={operation.value}>{operation.label}</option>)}
        </select>
        <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ubicación" className="rounded-xl border p-3" required />
        <input name="habitaciones" type="number" value={form.habitaciones} onChange={handleChange} placeholder="Habitaciones" className="rounded-xl border p-3" />
        <input name="banos" type="number" value={form.banos} onChange={handleChange} placeholder="Baños" className="rounded-xl border p-3" />
        <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} placeholder="Latitud" className="rounded-xl border p-3" />
        <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} placeholder="Longitud" className="rounded-xl border p-3" />
      </div>

      <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" className="min-h-28 w-full rounded-xl border p-3" required />

      <section className="space-y-4 rounded-2xl border border-dashed p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Medios de la propiedad</p>
            <p className="text-xs text-slate-500">{mediaSummary.images} imágenes · {mediaSummary.videos} videos · máximo {MAX_MEDIA_ITEMS}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
              <Upload size={14} className="mr-1 inline" /> Imágenes
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => handleFileSelection(event, 'image')}
                disabled={loading}
              />
            </label>
            <label className="cursor-pointer rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
              <Upload size={14} className="mr-1 inline" /> Videos
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                multiple
                className="hidden"
                onChange={(event) => handleFileSelection(event, 'video')}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {!mediaItems.length && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Agrega imágenes o videos para esta propiedad.</p>}

        <div className="space-y-3">
          {mediaItems.map((item, index) => (
            <div key={item.id} className="rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  {item.type === 'video' ? '🎬 Video' : '🖼️ Imagen'} · {item.name}
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => moveMedia(index, 'up')} disabled={loading || index === 0}><ArrowUp size={14} /></Button>
                  <Button type="button" variant="outline" onClick={() => moveMedia(index, 'down')} disabled={loading || index === mediaItems.length - 1}><ArrowDown size={14} /></Button>
                  <Button type="button" variant="outline" onClick={() => removeMedia(item.id)} disabled={loading}><Trash2 size={14} /></Button>
                </div>
              </div>

              <div className="mt-3">
                {item.type === 'image' ? (
                  <img src={item.url || item.previewUrl} alt={item.name} className="h-36 w-full rounded-lg object-cover md:w-72" />
                ) : (
                  <video src={item.url || item.previewUrl} controls className="h-36 w-full rounded-lg bg-black md:w-72" preload="metadata" />
                )}
              </div>

              {item.source === 'pending' && (
                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-brand-500 transition-all" style={{ width: `${item.progress || 0}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Subida: {item.progress || 0}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border">
        <MapContainer center={markerPosition} zoom={13} style={{ height: '320px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker position={markerPosition} onSelect={handleMapSelection} />
        </MapContainer>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input name="premium" type="checkbox" checked={form.premium} onChange={handleChange} /> Propiedad premium
      </label>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {successMessage && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</p>}

      <Button type="submit" disabled={loading || mediaCount > MAX_MEDIA_ITEMS}>{loading ? 'Guardando y subiendo medios...' : submitLabel}</Button>
    </form>
  );
}

export default PropertyForm;
