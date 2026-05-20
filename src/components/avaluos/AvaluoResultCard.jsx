function NumberItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-900/70 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="text-xl font-semibold text-amber-300">${Number(value || 0).toLocaleString()}</p>
    </div>
  );
}

function AvaluoResultCard({ result }) {
  if (!result) return null;

  return (
    <section className="mt-8 rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl animate-fade-in">
      <h3 className="text-2xl font-bold text-white">Resultado del avalúo</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <NumberItem label="Mínimo estimado" value={result.minimo} />
        <NumberItem label="Promedio estimado" value={result.promedio} />
        <NumberItem label="Máximo estimado" value={result.maximo} />
        <NumberItem label="Precio sugerido" value={result.sugeridoVenta} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-700 p-4 text-slate-200">Clasificación: <strong>{result.clasificacion}</strong></div>
        <div className="rounded-xl border border-slate-700 p-4 text-slate-200">Plusvalía: <strong>{result.plusvalia}x</strong></div>
      </div>
    </section>
  );
}

export default AvaluoResultCard;
