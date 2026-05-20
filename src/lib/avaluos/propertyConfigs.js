export const propertyTypes = [
  { key: 'terreno', label: 'Terreno', icon: '📐' },
  { key: 'casa', label: 'Casa', icon: '🏠' },
  { key: 'finca', label: 'Finca', icon: '🌿' },
  { key: 'quinta', label: 'Quinta', icon: '🌴' },
  { key: 'comercial', label: 'Comercial', icon: '🏬' },
  { key: 'industrial', label: 'Industrial', icon: '🏭' },
  { key: 'apartamento', label: 'Apartamento', icon: '🏢' },
  { key: 'bodega', label: 'Bodega', icon: '📦' },
];

export const dynamicForms = {
  terreno: ['ciudad', 'municipio', 'zona', 'areaTotal', 'topografia', 'acceso', 'servicios', 'usoPotencial', 'estadoLegal', 'observaciones'],
  casa: ['ciudad', 'municipio', 'zona', 'areaTerreno', 'areaConstruccion', 'habitaciones', 'banos', 'plantas', 'cochera', 'anioConstruccion', 'tipoConstruccion', 'material', 'estado', 'acabados', 'acceso', 'servicios', 'observaciones'],
  finca: ['ciudad', 'municipio', 'comunidad', 'manzanas', 'tipoFinca', 'aguaDisponible', 'energia', 'accesoVehicular', 'tipoTerreno', 'topografia', 'casaEnFinca', 'corrales', 'rioQuebrada', 'cultivos', 'potencialTuristico', 'observaciones'],
  comercial: ['ciudad', 'zona', 'areaTerreno', 'areaConstruccion', 'tipoComercial', 'flujoVehicular', 'parqueo', 'nivelComercial', 'estado', 'acceso', 'servicios', 'observaciones'],
};
