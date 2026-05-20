import { propertyTypes } from '../../lib/avaluos/propertyConfigs';

function PropertyTypeSelector({ selected, onSelect }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {propertyTypes.map((item) => (
        <button
          type="button"
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={`rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${
            selected === item.key ? 'border-amber-400 bg-slate-900 text-amber-300' : 'border-slate-700 bg-slate-800/70 text-slate-100'
          }`}
        >
          <p className="text-3xl">{item.icon}</p>
          <p className="mt-3 font-semibold">{item.label}</p>
        </button>
      ))}
    </div>
  );
}

export default PropertyTypeSelector;
