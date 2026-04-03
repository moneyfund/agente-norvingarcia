import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Link as LinkIcon, Trash2, Upload } from 'lucide-react';
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

const propertyTypes = ['casa', 'apartamento', 'terreno', 'bodega', 'hotel', 'propiedad comercial', 'edificio'];
const measurementUnits = [
  { value: 'varas', singularLabel: 'vara' },
  { value: 'metros', singularLabel: 'metro' },
  { value: 'manzanas', singularLabel: 'manzana' },
];
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
const VIDEO_URL_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'];

const initialState = {
  titulo: '',
  precio: '',
  tipo: 'casa',
  tipoOperacion: 'venta',
  ubicacion: '',
  descripcion: '',
  habitaciones: 0,
  banos: 0,
  area: '',
  areaConstruida: '',
  unidadMedida: 'varas',
  precioPorArea: null,
  lat: defaultCenter[0],
  lng: defaultCenter[1],
  premium: false,
};

const createExistingMediaItem = (item, index) => ({
  id: `existing-${item.path || item.url || index}`,
  status: 'existing',
  source: item.source || (item.path ? 'storage' : 'url'),
  type: item.type,
  url: item.url,
  path: item.path || null,
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
  status: 'pending',
  source: 'storage',
  type,
  file,
  name: file.name,
  previewUrl: URL.createObjectURL(file),
  progress: 0,
  createdAt: Date.now(),
});

const buildUrlMediaItem = ({ url, type, name }) => ({
  id: `url-${Math.random().toString(36).slice(2, 10)}`,
  status: 'url',
  source: 'url',
  type,
  url,
  path: null,
  name,
  createdAt: Date.now(),
});

const inferMediaTypeFromUrl = (url) => {
  const normalized = String(url || '').toLowerCase();
  return VIDEO_URL_EXTENSIONS.some((ext) => normalized.includes(ext)) ? 'video' : 'image';
};

const getFileMediaType = (file) => {
  if (IMAGE_TYPES.includes(file.type)) return 'image';
  if (VIDEO_TYPES.includes(file.type)) return 'video';
  return null;
};

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
  const [mediaMode, setMediaMode] = useState('direct');
  const [urlDraft, setUrlDraft] = useState('');
  const [urlTypeDraft, setUrlTypeDraft] = useState('auto');
  const [mediaItems, setMediaItems] = useState(() => normalizePropertyMedia(initialValues || {}).map(createExistingMediaItem));
  const [removedExistingMedia, setRemovedExistingMedia] = useState([]);

  useEffect(() => () => {
    mediaItems.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }, [mediaItems]);

  const mediaCount = mediaItems.length;
  const selectedUnit = measurementUnits.find((unit) => unit.value === form.unidadMedida) || measurementUnits[0];
  const parsedPrecio = Number(form.precio);
  const parsedArea = Number(form.area);
  const canCalculatePriceByArea = form.precio !== '' && form.area !== '' && Number.isFinite(parsedPrecio) && Number.isFinite(parsedArea) && parsedArea > 0;
  const computedPrecioPorArea = canCalculatePriceByArea ? parsedPrecio / parsedArea : null;

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

      if (target.status === 'pending' && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      if (target.status === 'existing') {
        setRemovedExistingMedia((current) => [...current, target]);
      }

      return prev.filter((item) => item.id !== itemId);
    });
  };

  const validateUrl = (rawUrl) => {
    let parsed;

    try {
      parsed = new URL(rawUrl);
    } catch (_error) {
      throw new Error('La URL ingresada no es válida.');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Solo se permiten URLs con http o https.');
    }

    return parsed.toString();
  };

  const handleAddUrlMedia = () => {
    try {
      if (!urlDraft.trim()) {
        throw new Error('Pega una URL antes de agregar el medio.');
      }

      if (mediaItems.length >= MAX_MEDIA_ITEMS) {
        throw new Error(`Solo puedes guardar hasta ${MAX_MEDIA_ITEMS} medios por propiedad.`);
      }

      const normalizedUrl = validateUrl(urlDraft.trim());
      const inferredType = inferMediaTypeFromUrl(normalizedUrl);
      const type = urlTypeDraft === 'auto' ? inferredType : urlTypeDraft;
      const fileName = decodeURIComponent(normalizedUrl.split('/').pop() || '').split('?')[0] || `medio-url-${mediaItems.length + 1}`;

      setMediaItems((prev) => [...prev, buildUrlMediaItem({
        url: normalizedUrl,
        type,
        name: fileName,
      })]);
      setUrlDraft('');
      setUrlTypeDraft('auto');
      setError('');
    } catch (urlError) {
      setError(urlError.message || 'No se pudo agregar la URL.');
    }
  };

  const validateFiles = (files) => {
    const invalidFile = files.find((file) => !getFileMediaType(file));
    if (invalidFile) {
      throw new Error(`El archivo ${invalidFile.name} no es un formato permitido.`);
    }

    const oversizeFile = files.find((file) => {
      const mediaType = getFileMediaType(file);
      const maxSize = mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      return file.size > maxSize;
    });

    if (oversizeFile) {
      const mediaType = getFileMediaType(oversizeFile);
      const maxSize = mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      const maxSizeMb = Math.round(maxSize / (1024 * 1024));
      throw new Error(`El archivo ${oversizeFile.name} supera el límite de ${maxSizeMb} MB.`);
    }
  };

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      validateFiles(files);
      if (mediaItems.length + files.length > MAX_MEDIA_ITEMS) {
        throw new Error(`Solo puedes guardar hasta ${MAX_MEDIA_ITEMS} medios por propiedad.`);
      }

      setMediaItems((prev) => [
        ...prev,
        ...files.map((file) => buildPendingMediaItem(file, getFileMediaType(file))),
      ]);
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
    const pendingImages = mediaItems.filter((item) => item.status === 'pending' && item.type === 'image');
    const pendingVideos = mediaItems.filter((item) => item.status === 'pending' && item.type === 'video');

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
        if (item.status === 'existing' || item.status === 'url') {
          return {
            type: item.type,
            source: item.source,
            url: item.url,
            path: item.source === 'url' ? null : item.path || null,
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

    if (!form.titulo || !form.ubicacion || !form.descripcion || form.precio === '') {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    const parsedAreaValue = form.area === '' ? null : Number(form.area);
    const parsedAreaConstruidaValue = form.areaConstruida === '' ? null : Number(form.areaConstruida);

    if (parsedAreaValue !== null && (!Number.isFinite(parsedAreaValue) || parsedAreaValue < 0)) {
      setError('El campo área debe contener un número válido mayor o igual a 0.');
      return;
    }

    if (parsedAreaConstruidaValue !== null && (!Number.isFinite(parsedAreaConstruidaValue) || parsedAreaConstruidaValue < 0)) {
      setError('El campo área construida debe contener un número válido mayor o igual a 0.');
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
        area: parsedAreaValue,
        areaConstruida: parsedAreaConstruidaValue,
        unidadMedida: form.unidadMedida || 'varas',
        precioPorArea: canCalculatePriceByArea ? computedPrecioPorArea : null,
        lat: Number(form.lat),
        lng: Number(form.lng),
        media: uploadedMedia,
        imagenes: uploadedMedia.filter((item) => item.type === 'image').map((item) => item.url),
      };

      await onSubmit(payload);
      setRemovedExistingMedia([]);
      setSuccessMessage('Propiedad guardada correctamente.');

      if (!initialValues) {
        setForm(initialState);
        setMediaItems([]);
        setMediaMode('direct');
        setUrlDraft('');
        setUrlTypeDraft('auto');
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
        <input name="area" type="number" min="0" step="any" value={form.area} onChange={handleChange} placeholder="Área" className="rounded-xl border p-3" />
        <input name="areaConstruida" type="number" min="0" step="any" value={form.areaConstruida} onChange={handleChange} placeholder="Área construida" className="rounded-xl border p-3" />
        <select name="unidadMedida" value={form.unidadMedida} onChange={handleChange} className="rounded-xl border p-3">
          {measurementUnits.map((unit) => <option key={unit.value} value={unit.value}>{unit.value}</option>)}
        </select>
        <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} placeholder="Latitud" className="rounded-xl border p-3" />
        <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} placeholder="Longitud" className="rounded-xl border p-3" />
      </div>
      <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
        {canCalculatePriceByArea
          ? `Precio por ${selectedUnit.singularLabel}: ${computedPrecioPorArea.toLocaleString('es-DO', { maximumFractionDigits: 2 })}`
          : `Precio por ${selectedUnit.singularLabel}: pendiente de cálculo (completa precio y área mayor que 0).`}
      </div>

      <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" className="min-h-28 w-full rounded-xl border p-3" required />

      <section className="space-y-4 rounded-2xl border border-dashed p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Medios de la propiedad</p>
            <p className="text-xs text-slate-500">{mediaSummary.images} imágenes · {mediaSummary.videos} videos · máximo {MAX_MEDIA_ITEMS}</p>
          </div>
        </div>

        <div className="inline-flex rounded-xl border bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMediaMode('url')}
            className={`rounded-lg px-3 py-2 text-sm transition ${mediaMode === 'url' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}
            disabled={loading}
          >
            <LinkIcon size={14} className="mr-1 inline" /> Subir con URL
          </button>
          <button
            type="button"
            onClick={() => setMediaMode('direct')}
            className={`rounded-lg px-3 py-2 text-sm transition ${mediaMode === 'direct' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}
            disabled={loading}
          >
            <Upload size={14} className="mr-1 inline" /> Subir directamente
          </button>
        </div>

        {mediaMode === 'url' ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="mb-2 text-xs text-slate-600">Puedes pegar URLs de imágenes o videos públicos (mp4/webm/mov). Se guardan en Firestore con source=url y path=null.</p>
            <div className="flex flex-col gap-2 md:flex-row">
              <input
                type="url"
                placeholder="https://ejemplo.com/media/propiedad.jpg"
                value={urlDraft}
                onChange={(event) => setUrlDraft(event.target.value)}
                className="w-full rounded-xl border p-3 text-sm"
                disabled={loading}
              />
              <select
                value={urlTypeDraft}
                onChange={(event) => setUrlTypeDraft(event.target.value)}
                className="rounded-xl border p-3 text-sm"
                disabled={loading}
              >
                <option value="auto">Auto detectar</option>
                <option value="image">Imagen</option>
                <option value="video">Video</option>
              </select>
              <Button type="button" onClick={handleAddUrlMedia} disabled={loading}>Agregar URL</Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="mb-2 text-xs text-slate-600">Selecciona imágenes o videos para subir a Firebase Storage con barra de progreso real.</p>
            <label className="inline-flex cursor-pointer items-center rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50">
              <Upload size={14} className="mr-1 inline" /> Seleccionar archivos
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                multiple
                className="hidden"
                onChange={handleFileSelection}
                disabled={loading}
              />
            </label>
          </div>
        )}

        {!mediaItems.length && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Agrega imágenes o videos para esta propiedad.</p>}

        <div className="space-y-3">
          {mediaItems.map((item, index) => (
            <div key={item.id} className="rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  {item.type === 'video' ? '🎬 Video' : '🖼️ Imagen'} · {item.name}
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">{item.source}</span>
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

              {item.status === 'pending' && (
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
