import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/Button';
import PropertyForm from '../components/PropertyForm';
import {
  createPropiedad,
  deletePropiedad,
  getPropiedades,
  updatePropiedad,
} from '../../services/propiedadesService';

function AdminPropertiesPage() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [pageError, setPageError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setPageError('');
    try {
      setPropiedades(await getPropiedades());
    } catch (error) {
      console.error('[AdminPropertiesPage] Error cargando propiedades', error);
      setPageError(error.message || 'No fue posible cargar propiedades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (payload) => {
    setActionLoading(true);
    setPageError('');
    try {
      await createPropiedad(payload);
      await loadData();
    } catch (error) {
      console.error('[AdminPropertiesPage] Error creando propiedad', error);
      setPageError(error.message || 'No fue posible crear la propiedad.');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!selected?.id) return;

    setActionLoading(true);
    setPageError('');

    try {
      await updatePropiedad(selected.id, payload);
      setSelected(null);
      await loadData();
    } catch (error) {
      console.error('[AdminPropertiesPage] Error actualizando propiedad', error);
      setPageError(error.message || 'No fue posible actualizar la propiedad.');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (actionLoading) return;
    if (!window.confirm('¿Seguro que deseas eliminar esta propiedad?')) return;

    setActionLoading(true);
    setPageError('');

    try {
      await deletePropiedad(id);
      if (selected?.id === id) {
        setSelected(null);
      }
      await loadData();
    } catch (error) {
      console.error('[AdminPropertiesPage] Error eliminando propiedad', error);
      setPageError(error.message || 'No fue posible eliminar la propiedad.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de propiedades</h1>

      {pageError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{pageError}</p>}

      <PropertyForm
        key={selected?.id || 'new'}
        initialValues={selected}
        onSubmit={selected ? handleUpdate : handleCreate}
        submitLabel={selected ? 'Actualizar propiedad' : 'Crear propiedad'}
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Operación</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Premium</th>
              <th className="px-4 py-3">Edición visual IA</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {propiedades.map((property) => (
              <tr key={property.id} className="border-t">
                <td className="px-4 py-3">{property.titulo}</td>
                <td className="px-4 py-3 capitalize">{property.tipo}</td>
                <td className="px-4 py-3 capitalize">{property.tipoOperacion || 'venta'}</td>
                <td className="px-4 py-3">US$ {Number(property.precio || 0).toLocaleString('es-DO')}</td>
                <td className="px-4 py-3">{property.premium ? 'Sí' : 'No'}</td>
                <td className="px-4 py-3">{property.editableConIA ? 'Sí' : 'No'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={actionLoading} onClick={() => setSelected(property)}><Pencil size={16} /></Button>
                    <Button variant="outline" disabled={actionLoading} onClick={() => handleDelete(property.id)}><Trash2 size={16} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !propiedades.length && <p className="p-4 text-sm text-slate-500">No hay propiedades registradas.</p>}
        {loading && <p className="p-4 text-sm text-slate-500">Cargando propiedades...</p>}
      </div>
    </div>
  );
}

export default AdminPropertiesPage;
