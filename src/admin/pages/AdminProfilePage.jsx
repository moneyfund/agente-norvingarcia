import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import { getAgente, saveAgente, uploadAgentPhoto } from '../../services/agentesService';

const initialState = {
  nombre: 'Norvin García',
  foto: '',
  biografia: '',
  whatsapp: '',
  facebook: '',
  instagram: '',
  tiktok: '',
};

function AdminProfilePage() {
  const [form, setForm] = useState(initialState);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const agent = await getAgente();
        if (agent) {
          setForm((prev) => ({ ...prev, ...agent }));
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      let foto = form.foto;
      if (photoFile) {
        foto = await uploadAgentPhoto(photoFile);
      }
      await saveAgente({ ...form, foto });
      setForm((prev) => ({ ...prev, foto }));
      setMessage('Perfil actualizado correctamente.');
    } catch (error) {
      setMessage(error.message || 'No fue posible guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando perfil...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Perfil del agente</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <input value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} className="rounded-xl border p-3" placeholder="Nombre" required />
          <input value={form.whatsapp} onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))} className="rounded-xl border p-3" placeholder="WhatsApp" />
          <input value={form.facebook} onChange={(e) => setForm((prev) => ({ ...prev, facebook: e.target.value }))} className="rounded-xl border p-3" placeholder="Facebook" />
          <input value={form.instagram} onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))} className="rounded-xl border p-3" placeholder="Instagram" />
          <input value={form.tiktok} onChange={(e) => setForm((prev) => ({ ...prev, tiktok: e.target.value }))} className="rounded-xl border p-3" placeholder="TikTok" />
          <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="rounded-xl border p-3" />
        </div>
        <textarea value={form.biografia} onChange={(e) => setForm((prev) => ({ ...prev, biografia: e.target.value }))} className="min-h-28 w-full rounded-xl border p-3" placeholder="Biografía" />
        {form.foto && <img src={form.foto} alt={form.nombre} className="h-32 w-32 rounded-full object-cover" />}
        {message && <p className="rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar perfil'}</Button>
      </form>
    </div>
  );
}

export default AdminProfilePage;
