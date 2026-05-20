import type { Acceso, Topografia } from '../types/avaluo.types';

export const TOPOGRAFIA: Record<Topografia, number> = {
  plano: 1,
  semiPlano: 0.95,
  inclinado: 0.85,
  quebrado: 0.7,
};

export const ACCESO: Record<Acceso, number> = {
  pavimentado: 1,
  adoquinado: 0.96,
  macadan: 0.9,
  tierra: 0.82,
};

export const SERVICIOS = {
  agua: 1.03,
  energia: 1.03,
  internet: 1.02,
  drenaje: 1.02,
} as const;

export const PLUSVALIA = {
  alta: 1.08,
  media: 1,
  emergente: 0.95,
} as const;

export const ESTADO_CONSTRUCCION = { excelente: 1, bueno: 0.95, regular: 0.88, malo: 0.78 } as const;
export const ACABADOS = { premium: 1.05, alto: 1, medio: 0.94, basico: 0.88, obraGris: 0.8 } as const;
