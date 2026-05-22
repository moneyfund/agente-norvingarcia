export const exportAvaluoToPdf = (avaluo: any) => {
  const html = `<!doctype html><html><body><h1>Informe Técnico Inmobiliario</h1><p>Fecha: ${new Date().toLocaleDateString()}</p><h2>${avaluo.titulo}</h2><p>Zona: ${avaluo.zona}</p><p>Valor final: $${Number(avaluo.valorFinal).toFixed(2)}</p><pre>${JSON.stringify(avaluo.coeficientesAplicados,null,2)}</pre><p>Firma profesional: Norvin García Real Estate</p></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html); w.document.close(); w.print();
};
