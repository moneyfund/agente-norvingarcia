export const factoresTopograficos = {
  plano: 1,
  semiPlano: 0.95,
  inclinado: 0.88,
  quebrado: 0.8,
};

export const factoresAcceso = {
  pavimentado: 1,
  adoquinado: 0.97,
  macadan: 0.9,
  tierra: 0.82,
};

export const factoresServicios = {
  agua: 1.03,
  energia: 1.03,
  internet: 1.02,
  drenaje: 1.04,
};

export const factoresConstructivos = {
  lujo: 1.35,
  residencialAlta: 1.2,
  media: 1,
  economica: 0.88,
  precaria: 0.72,
};

export const factoresComerciales = {
  local: 1,
  plaza: 1.2,
  oficina: 1.08,
  restaurante: 1.15,
  hotel: 1.3,
  bodega: 0.92,
};

export const factoresEstado = {
  excelente: 1.18,
  bueno: 1.05,
  regular: 0.9,
  malo: 0.75,
};

export const factoresAntiguedad = {
  nueva: 1.12,
  reciente: 1.04,
  media: 0.95,
  antigua: 0.86,
};
