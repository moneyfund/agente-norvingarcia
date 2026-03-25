import { useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../../components/Button';
import { propertyMarkerIcon } from '../../utils/mapMarkers';

const propertyTypes = ['casa', 'apartamento', 'terreno', 'bodega'];
const operationTypes = [
  { value: 'venta', label: 'Venta' },
  { value: 'alquiler', label: 'Alquiler' },
];
const defaultCenter = [18.4861, -69.9312];
const placeholderImage = 'https://via.placeholder.com/600x400?text=Sin+imagen';

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
  imagenes: [''],
};

const isValidImageUrl = (value) => {
  if (!value?.trim()) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
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
    imagenes: Array.isArray(initialValues?.imagenes) && initialValues.imagenes.length
      ? initialValues.imagenes
      : initialValues?.imagen
        ? [initialValues.imagen]
        : [''],
  };

  const [form, setForm] = useState(mergedValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (index, value) => {
    setForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes.map((image, imageIndex) => (imageIndex === index ? value : image)),
    }));
  };

  const handleAddImage = () => {
    setForm((prev) => ({ ...prev, imagenes: [...prev.imagenes, ''] }));
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => {
      if (prev.imagenes.length === 1) return { ...prev, imagenes: [''] };
      return { ...prev, imagenes: prev.imagenes.filter((_, imageIndex) => imageIndex !== index) };
    });
  };

  const handleMapSelection = ({ lat, lng }) => {
    setForm((prev) => ({
      ...prev,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.titulo || !form.ubicacion || !form.descripcion || !form.precio) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    const cleanedImages = form.imagenes
      .map((image) => image.trim())
      .filter(Boolean);

    const hasInvalidUrl = cleanedImages.some((image) => !isValidImageUrl(image));
    if (hasInvalidUrl) {
      setError('Todas las URLs de imágenes deben iniciar con http:// o https://');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        precio: Number(form.precio),
        habitaciones: Number(form.habitaciones),
        banos: Number(form.banos),
        lat: Number(form.lat),
        lng: Number(form.lng),
        imagenes: cleanedImages,
      };

      await onSubmit(payload);
      if (!initialValues) {
        setForm(initialState);
      }
    } catch (submitError) {
      setError(submitError.message || 'Error guardando la propiedad.');
    } finally {
      setLoading(false);
    }
  };

  const markerPosition = [Number(form.lat) || defaultCenter[0], Number(form.lng) || defaultCenter[1]];

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

      <div className="space-y-3 rounded-xl border border-dashed p-3">
        <p className="text-sm font-medium">Imágenes por URL</p>
        {form.imagenes.map((image, index) => (
          <div key={`image-${index}`} className="space-y-2 rounded-xl border p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={image}
                onChange={(event) => handleImageChange(index, event.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border p-3"
              />
              <Button type="button" variant="outline" onClick={() => handleRemoveImage(index)}>Quitar</Button>
            </div>
            <img
              src={isValidImageUrl(image) ? image : placeholderImage}
              alt="Vista previa"
              className="h-24 w-full rounded-lg object-cover md:w-64"
            />
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleAddImage}>Agregar otra imagen</Button>
      </div>

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

      <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : submitLabel}</Button>
    </form>
  );
}

export default PropertyForm;
