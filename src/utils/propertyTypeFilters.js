export const terrainFocusedTypes = ['terreno', 'terrenos', 'finca', 'quintas', 'quinta', 'lote', 'lotes', 'parcela', 'parcelas', 'solar'];

export const normalizeText = (value = '') => value.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const isLandOrFarmProperty = (property = {}) => {
  const propertyType = normalizeText(property.tipo);
  return terrainFocusedTypes.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return propertyType === normalizedKeyword || propertyType.includes(normalizedKeyword);
  });
};
