import { useMemo, useState } from 'react';
import { dynamicForms } from '../../lib/avaluos/propertyConfigs';

const options = {
  topografia: ['plano', 'semiPlano', 'inclinado', 'quebrado'],
  acceso: ['pavimentado', 'adoquinado', 'macadan', 'tierra'],
  tipoConstruccion: ['lujo', 'residencialAlta', 'media', 'economica', 'precaria'],
  material: ['concreto', 'mamposteria reforzada', 'bloque simple', 'madera', 'mixto'],
  estado: ['excelente', 'bueno', 'regular', 'malo'],
  acabados: ['premium', 'alto', 'medio', 'basico', 'obra gris'],
  usoPotencial: ['residencial', 'comercial', 'industrial', 'agricola', 'turistico'],
  estadoLegal: ['escritura', 'cesion', 'sin documentos'],
  tipoFinca: ['ganadera', 'cafetalera', 'agricola', 'forestal', 'mixta'],
  tipoComercial: ['local', 'plaza', 'oficina', 'restaurante', 'hotel', 'bodega'],
};

const serviceLabels = ['agua', 'energia', 'internet', 'drenaje'];

function DynamicAvaluoForm({ type, onSubmit, loading }) {
  const [formData, setFormData] = useState({ servicios: [] });
  const fields = useMemo(() => dynamicForms[type] || [], [type]);

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleService = (service) => {
    setFormData((prev) => ({
      ...prev,
      servicios: prev.servicios?.includes(service) ? prev.servicios.filter((s) => s !== service) : [...(prev.servicios || []), service],
    }));
  };

  return (
    <form
      className="mt-8 grid gap-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
    >
      {fields.map((field) => {
        if (field === 'servicios') {
          return <div key={field} className="flex flex-wrap gap-3">{serviceLabels.map((s) => <label className="text-slate-200" key={s}><input type="checkbox" className="mr-2" checked={formData.servicios?.includes(s)} onChange={() => toggleService(s)} />{s}</label>)}</div>;
        }
        if (options[field]) {
          return (
            <select key={field} required className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200" value={formData[field] || ''} onChange={(e) => updateField(field, e.target.value)}>
              <option value="">Seleccione {field}</option>
              {options[field].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          );
        }
        return (
          <input
            key={field}
            required={!['observaciones'].includes(field)}
            placeholder={field}
            value={formData[field] || ''}
            onChange={(e) => updateField(field, e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 placeholder:text-slate-500"
          />
        );
      })}
      <button disabled={loading} className="rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60" type="submit">
        {loading ? 'Calculando...' : 'Calcular avalúo'}
      </button>
    </form>
  );
}

export default DynamicAvaluoForm;
