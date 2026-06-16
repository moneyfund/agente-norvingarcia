const money = (value: unknown) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));

export function generateAvaluoAnalysis(avaluo: any) {
  const tipo = avaluo?.tipoPropiedad === 'casa' ? 'La vivienda' : 'El terreno';
  const ciudad = avaluo?.ciudad || 'la ciudad indicada';
  const zona = avaluo?.zona || 'la zona registrada';
  const clasificacion = avaluo?.zonaSnapshot?.clasificacion || avaluo?.caracteristicas?.tipoTerritorio || 'clasificación urbana referencial';
  const entorno = avaluo?.caracteristicas?.entorno || avaluo?.caracteristicas?.tipoEntorno || 'entorno inmobiliario mixto';
  const confianza = avaluo?.nivelConfianza || 'media';
  const rango = avaluo?.rangoMercado ? `entre ${money(avaluo.rangoMercado.minimo)} y ${money(avaluo.rangoMercado.maximo)}` : 'dentro de un rango de mercado razonable';
  const servicios = avaluo?.caracteristicas?.serviciosBasicos;
  const tieneServicios = servicios && Object.values(servicios).some(Boolean);
  const extraCasa = avaluo?.tipoPropiedad === 'casa'
    ? ` La construcción aporta valor por sus características de área, estado, acabados y funcionalidad habitacional, elementos que influyen directamente en la liquidez comercial del activo.`
    : ` La ponderación integra condiciones de suelo, topografía, acceso, uso potencial y desarrollo urbano, factores críticos para estimar su aprovechamiento y absorción de mercado.`;

  return `${tipo} evaluado se ubica en ${zona}, ${ciudad}, con ${clasificacion} y un ${entorno}. ${tieneServicios ? 'La presencia de servicios básicos disponibles fortalece su atractivo comercial y reduce riesgos operativos para una negociación.' : 'La disponibilidad de servicios y condiciones de acceso debe validarse en campo para operaciones definitivas.'}${extraCasa} El valor estimado de ${money(avaluo?.valorFinal)} se posiciona ${rango}, con nivel de confianza ${confianza}, por lo que funciona como referencia técnica preliminar para compra, venta, negociación o análisis patrimonial.`;
}
