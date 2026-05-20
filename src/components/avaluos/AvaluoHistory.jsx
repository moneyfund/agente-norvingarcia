function AvaluoHistory({ items }) {
  return (
    <section className="mt-8">
      <h3 className="text-xl font-semibold text-white">Historial de avalúos</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-slate-200">
            <p className="font-semibold">{item.tipoPropiedad} · {item.zona || 'Zona no definida'}</p>
            <p className="text-sm text-slate-400">{item.ciudad} / {item.municipio || '-'}</p>
            <p className="text-amber-300">Valor final: ${Number(item.valorFinal || 0).toLocaleString()}</p>
          </article>
        ))}
        {!items.length && <p className="text-slate-400">No hay avalúos guardados aún.</p>}
      </div>
    </section>
  );
}

export default AvaluoHistory;
