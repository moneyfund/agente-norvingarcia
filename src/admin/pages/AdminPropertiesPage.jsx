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

  const loadData = async () => {
    setLoading(true);
    try {
      setPropiedades(await getPropiedades());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (payload) => {
    await createPropiedad(payload);
    await loadData();
  };

  const handleUpdate = async (payload) => {
    await updatePropiedad(selected.id, payload);
    setSelected(null);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta propiedad?')) return;
    await deletePropiedad(id);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de propiedades</h1>

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
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Premium</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {propiedades.map((property) => (
              <tr key={property.id} className="border-t">
                <td className="px-4 py-3">{property.titulo}</td>
                <td className="px-4 py-3 capitalize">{property.tipo}</td>
                <td className="px-4 py-3">US$ {Number(property.precio || 0).toLocaleString('es-DO')}</td>
                <td className="px-4 py-3">{property.premium ? 'Sí' : 'No'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelected(property)}><Pencil size={16} /></Button>
                    <Button variant="outline" onClick={() => handleDelete(property.id)}><Trash2 size={16} /></Button>
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
