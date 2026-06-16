const money = (value: unknown) => `$${Number(value || 0).toFixed(2)}`;
const number = (value: unknown) => Number(value || 0).toLocaleString('es-NI', { maximumFractionDigits: 2 });
const impactText = (coeficiente: unknown) => {
  const pct = (Number(coeficiente || 1) - 1) * 100;
  if (Math.abs(pct) < 0.1) return '0%';
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
};
const isScaleOrRuralCap = (factor: unknown) => /escala|grandes extensiones|tope técnico|normalización|manzana/i.test(String(factor));
const normalizeImpactSign = (coef: any) => {
  const numericCoef = Number(coef.coeficiente || 1);
  if (!isScaleOrRuralCap(coef.factor) || numericCoef <= 1) return { ...coef, coeficiente: numericCoef, impacto: coef.impacto || impactText(numericCoef) };
  const correctedCoef = numericCoef > 0 ? Math.min(1, 1 / numericCoef) : 1;
  return { ...coef, coeficiente: correctedCoef, impacto: impactText(correctedCoef) };
};
const normalizeCoeficientes = (coeficientesAplicados: any) => (Array.isArray(coeficientesAplicados)
  ? coeficientesAplicados
  : Object.entries(coeficientesAplicados || {}).map(([factor, coeficiente]) => ({ factor, valorAplicado: Number(coeficiente).toFixed(3), coeficiente: Number(coeficiente), impacto: impactText(coeficiente) }))
).map(normalizeImpactSign);
const list = (value: any) => Array.isArray(value) ? value.join(', ') : (value || 'N/D');
const serviciosBasicosText = (servicios: any = {}) => [
  ['Agua potable', servicios.agua],
  ['Energía eléctrica', servicios.energia],
  ['Sistema de drenaje', servicios.drenaje],
  ['Señal telefónica', servicios.senalTelefonica],
  ['Internet', servicios.internet],
].map(([label, enabled]) => `${label}: ${enabled ? 'Sí' : 'No'}`).join('<br/>');

export const exportAvaluoToPdf = (avaluo: any) => {
  const c = avaluo?.caracteristicas || {};
  const coeficientes = normalizeCoeficientes(avaluo?.coeficientesAplicados);
  const rows = coeficientes.map((coef: any) => `<tr><td>${coef.factor}</td><td>${coef.valorAplicado}</td><td>${coef.impacto}</td></tr>`).join('');
  const terreno = avaluo?.tipoPropiedad === 'terreno' ? `
    <h2>Ficha técnica de terreno</h2>
    <table>
      <tr><td>Unidad de área usada</td><td>${avaluo.unidadArea === 'manzana' ? 'Manzanas' : 'Metros cuadrados'}</td></tr>
      <tr><td>Área original</td><td>${number(avaluo.areaOriginal || c.areaOriginal)}</td></tr>
      <tr><td>Área convertida</td><td>${number(avaluo.areaM2Convertida || c.areaM2Convertida)} m²</td></tr>
      <tr><td>Categoría territorial</td><td>${c.tipoTerritorio || 'N/D'}</td></tr>
      <tr><td>Tipo de suelo</td><td>${c.tipoSuelo || 'N/D'}</td></tr>
      <tr><td>Topografía</td><td>${c.topografia || 'N/D'}</td></tr>
      <tr><td>Accesos</td><td>${c.accesoGeneral || 'N/D'} · ${c.tipoVia || 'N/D'}</td></tr>
      <tr><td>Recursos naturales</td><td>${list(c.recursosNaturales)}</td></tr>
      <tr><td>Riesgos</td><td>${list(c.riesgos)}</td></tr>
      <tr><td>Servicios básicos</td><td>${serviciosBasicosText(c.serviciosBasicos)}</td></tr>
      <tr><td>Deforestación</td><td>${c.nivelDeforestacion || 'N/D'}</td></tr>
      <tr><td>Uso potencial</td><td>${c.usoPotencial || 'N/D'}</td></tr>
      <tr><td>Desarrollo urbano</td><td>${c.desarrolloUrbano || 'N/D'}</td></tr>
      <tr><td>Rango de mercado</td><td>${money(avaluo.rangoMercado?.minimo)} - ${money(avaluo.rangoMercado?.maximo)}</td></tr>
    </table>` : '';

  const html = `<!doctype html><html><head><style>body{font-family:Arial,sans-serif;color:#1e293b;padding:32px}h1{color:#0f172a}h2{margin-top:24px;color:#334155}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#f1f5f9}.highlight{background:#ecfdf5;border:1px solid #a7f3d0;padding:14px;border-radius:10px;margin:12px 0}</style></head><body><h1>Informe Técnico Inmobiliario</h1><p>Fecha: ${new Date().toLocaleDateString('es-NI')}</p><h2>${avaluo.titulo}</h2><p>Zona: ${avaluo.zona}, ${avaluo.ciudad}</p>${terreno || `<h2>Servicios básicos</h2><table><tr><td>Detalle</td><td>${serviciosBasicosText(c.serviciosBasicos)}</td></tr></table>`}<div class='highlight'><strong>Valor final:</strong> ${money(avaluo.valorFinal)}</div><h2>Coeficientes aplicados</h2><table><thead><tr><th>Factor</th><th>Valor aplicado</th><th>Impacto</th></tr></thead><tbody>${rows}</tbody></table><p>Firma profesional: Norvin García Real Estate</p></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html); w.document.close(); w.print();
};
