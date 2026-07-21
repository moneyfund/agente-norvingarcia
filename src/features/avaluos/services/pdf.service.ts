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
  const casa = avaluo?.tipoPropiedad === 'casa' ? `
    <h2>Características generales</h2><table>
      <tr><td>Área terreno original</td><td>${number(c.areaOriginal || avaluo.areaOriginal)} ${c.unidad === 'vara2' || avaluo.unidadArea === 'vara2' ? 'varas²' : 'm²'}</td></tr>
      <tr><td>Área terreno convertida</td><td>${number(c.areaConvertida || c.areaM2Convertida || avaluo.areaM2Convertida)} m²</td></tr>
      <tr><td>Área construcción</td><td>${number(c.areaConstruccion)} m²</td></tr>
      <tr><td>Uso</td><td>${c.usoInmueble || 'N/D'}</td></tr><tr><td>Dirección</td><td>${c.direccion || 'N/D'}</td></tr>
    </table>
    <h2>Distribución</h2><table><tr><td>Habitaciones</td><td>${c.habitaciones || 'N/D'}</td></tr><tr><td>Baños completos / medios</td><td>${c.banos || '0'} / ${c.mediosBanos || '0'}</td></tr><tr><td>Amenidades</td><td>${list(['sala','comedor','cocina','terraza','balcon','patio','jardin','garaje','piscina','rancho','oficina','estudio','areaBBQ'].filter((k) => c[k]))}</td></tr></table>
    <h2>Calidad constructiva</h2><table><tr><td>Calidad</td><td>${c.calidadConstructiva || c.acabados || 'N/D'}</td></tr><tr><td>Techo / piso / paredes</td><td>${c.tipoTecho || 'N/D'} · ${c.tipoPiso || 'N/D'} · ${c.tipoParedes || 'N/D'}</td></tr><tr><td>Sistemas</td><td>Eléctrico ${c.sistemaElectrico || 'N/D'} · Hidráulico ${c.sistemaHidraulico || 'N/D'} · Sanitario ${c.sistemaSanitario || 'N/D'} · Pluvial ${c.sistemaPluvial || 'N/D'}</td></tr></table>
    <h2>Estado técnico</h2><table><tr><td>Estado general</td><td>${c.estadoGeneral || c.estadoConstruccion || 'N/D'}</td></tr><tr><td>Mantenimiento</td><td>${c.nivelMantenimiento || 'N/D'}</td></tr><tr><td>Antigüedad</td><td>${c.antiguedad || 'N/D'}</td></tr><tr><td>Documentación</td><td>Escritura ${c.escritura || 'N/D'} · Catastro ${c.catastro || 'N/D'} · Libre gravamen ${c.libreGravamen || 'N/D'}</td></tr></table>
    <h2>Fortalezas</h2><p>${list([c.calidadConstructiva === 'Premium' || c.acabados === 'Premium' ? 'Acabados premium' : null, c.cocinaModerna ? 'Cocina moderna' : null, c.garaje ? 'Garaje' : null, c.sistemaCCTV ? 'CCTV' : null, c.panelesSolares ? 'Paneles solares' : null].filter(Boolean))}</p>
    <h2>Debilidades</h2><p>${list([c.estadoGeneral === 'Regular' || c.estadoGeneral === 'Malo' ? 'Estado general requiere atención' : null, c.nivelMantenimiento === 'Regular' || c.nivelMantenimiento === 'Malo' ? 'Mantenimiento limitado' : null, c.libreGravamen === 'Pendiente' ? 'Libre gravamen pendiente' : null].filter(Boolean))}</p>
    <h2>Factores positivos</h2><p>${list(coeficientes.filter((x:any)=>Number(x.coeficiente)>1.01).map((x:any)=>x.factor))}</p>
    <h2>Factores limitantes</h2><p>${list(coeficientes.filter((x:any)=>Number(x.coeficiente)<0.99).map((x:any)=>x.factor))}</p>
    <h2>Conclusión técnica</h2><p>El resultado integra una matriz ponderada por ubicación, terreno, construcción, estado técnico-documental y extras.</p>
    <h2>Conclusión comercial</h2><p>${avaluo.analisisProfesional || 'El inmueble presenta una posición comercial acorde con las variables registradas.'}</p>
    <h2>Recomendaciones</h2><p>Validar medidas, documentación legal, estado de sistemas y evidencia fotográfica antes de cierre bancario o compraventa.</p>` : '';

  const ruralSurScale = avaluo?.ruralSurScaleApplied ? `
    <h2>Escala</h2>
    <table>
      <tr><td>Curva territorial por extensión</td><td>${number(avaluo.areaManzanas)} manzanas</td></tr>
      <tr><td>Precio base por manzana</td><td>${money(avaluo.basePricePerManzana)}</td></tr>
      <tr><td>Precio base equivalente por m²</td><td>${money(avaluo.basePriceM2)}</td></tr>
      <tr><td>Valor base según curva</td><td>${money(avaluo.baseValueTotal || avaluo.valorBase)}</td></tr>
      <tr><td>Normalización adicional</td><td>No aplicada; incluida en la curva territorial</td></tr>
      <tr><td>Factor técnico posterior</td><td>${Number(avaluo.technicalAdjustmentFactor || 1).toFixed(3)}</td></tr>
      <tr><td>Precio final por manzana</td><td>${money(avaluo.pricePerManzana)}</td></tr>
      <tr><td>Precio final por m²</td><td>${money(avaluo.adjustedPriceM2 || avaluo.valorM2)}</td></tr>
      <tr><td>Valor final</td><td>${money(avaluo.valorFinal || avaluo.valorFinalEstimado || avaluo.estimatedValue)}</td></tr>
    </table>` : '';

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
    </table>${ruralSurScale}` : '';

  const html = `<!doctype html><html><head><style>body{font-family:Arial,sans-serif;color:#1e293b;padding:32px}h1{color:#0f172a}h2{margin-top:24px;color:#334155}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#f1f5f9}.highlight{background:#ecfdf5;border:1px solid #a7f3d0;padding:14px;border-radius:10px;margin:12px 0}</style></head><body><h1>Informe Técnico Inmobiliario</h1><p>Fecha: ${new Date().toLocaleDateString('es-NI')}</p><h2>${avaluo.titulo}</h2><p>Ciudad: ${avaluo.ciudad}</p><p>Zona: ${avaluo.zona}</p><p>Clasificación territorial: ${avaluo.zonaSnapshot?.clasificacion || 'N/D'}</p><p>Tipo de entorno: ${avaluo.zonaSnapshot?.tipoEntorno || 'N/D'}</p><p>Factor de plusvalía: ${avaluo.zonaSnapshot?.factorPlusvalia || 'N/D'}</p><p>Valor base m² usado: ${money(avaluo.ruralSurScaleApplied ? avaluo.basePriceM2 : (avaluo.zonaSnapshot?.valorTerrenoM2 || avaluo.valorM2 || 0))}</p><p>Observación técnica: ${avaluo.zonaSnapshot?.observacionTecnica || 'N/D'}</p>${terreno || casa || `<h2>Servicios básicos</h2><table><tr><td>Detalle</td><td>${serviciosBasicosText(c.serviciosBasicos)}</td></tr></table>`}<div class='highlight'><strong>Valor final:</strong> ${money(avaluo.valorFinal)}</div><h2>Coeficientes aplicados</h2><table><thead><tr><th>Factor</th><th>Valor aplicado</th><th>Impacto</th></tr></thead><tbody>${rows}</tbody></table><p>Firma profesional: Norvin García Real Estate</p></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html); w.document.close(); w.print();
};
