import { useMemo, useState } from 'react';
import Button from '../../components/Button';
import { uploadPropertyImages } from '../../services/propiedadesService';

const propertyTypes = ['casa', 'apartamento', 'terreno', 'bodega'];

const initialState = {
  titulo: '',
  precio: '',
  tipo: 'casa',
  ubicacion: '',
  descripcion: '',
  habitaciones: 0,
  banos: 0,
  lat: '',
  lng: '',
  premium: false,
  imagenes: [],
};

function PropertyForm({ initialValues, onSubmit, submitLabel = 'Guardar' }) {
  const [form, setForm] = useState({ ...initialState, ...initialValues });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files],
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.titulo || !form.ubicacion || !form.descripcion || !form.precio) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    try {
      setLoading(true);
      const uploadedUrls = await uploadPropertyImages(files);
      const payload = {
        ...form,
        precio: Number(form.precio),
        habitaciones: Number(form.habitaciones),
        banos: Number(form.banos),
        lat: Number(form.lat),
        lng: Number(form.lng),
        imagenes: [...(form.imagenes || []), ...uploadedUrls],
      };

      await onSubmit(payload);
      if (!initialValues) {
        setForm(initialState);
      }
      setFiles([]);
    } catch (submitError) {
      setError(submitError.message || 'Error guardando la propiedad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título" className="rounded-xl border p-3" required />
        <input name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="Precio" className="rounded-xl border p-3" required />
        <select name="tipo" value={form.tipo} onChange={handleChange} className="rounded-xl border p-3">
          {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ubicación" className="rounded-xl border p-3" required />
        <input name="habitaciones" type="number" value={form.habitaciones} onChange={handleChange} placeholder="Habitaciones" className="rounded-xl border p-3" />
        <input name="banos" type="number" value={form.banos} onChange={handleChange} placeholder="Baños" className="rounded-xl border p-3" />
        <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} placeholder="Latitud" className="rounded-xl border p-3" />
        <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} placeholder="Longitud" className="rounded-xl border p-3" />
      </div>

      <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" className="min-h-28 w-full rounded-xl border p-3" required />

      <div className="rounded-xl border border-dashed p-3">
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        <p className="mt-2 text-xs text-slate-500">Las imágenes se guardarán en Firebase Storage en /propiedades.</p>
      </div>

      {!!(form.imagenes?.length || previews.length) && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {form.imagenes?.map((url) => <img key={url} src={url} alt="imagen" className="h-24 w-full rounded-lg object-cover" />)}
          {previews.map((preview) => <img key={preview.name} src={preview.url} alt={preview.name} className="h-24 w-full rounded-lg object-cover" />)}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input name="premium" type="checkbox" checked={form.premium} onChange={handleChange} /> Propiedad premium
      </label>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : submitLabel}</Button>
    </form>
  );
}

export default PropertyForm;
