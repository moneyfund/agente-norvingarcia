export const FACTOR_ESTADO = { excelente: 1.15, bueno: 1, regular: 0.85, malo: 0.65 } as const;
export const FACTOR_ACABADOS = { premium: 1.25, alto: 1.1, medio: 1, basico: 0.82 } as const;
export const FACTOR_TOPOGRAFIA = { plano: 1, semiPlano: 0.94, inclinado: 0.83, quebrado: 0.68 } as const;
export const FACTOR_ACCESO = { pavimentado: 1.08, adoquinado: 1.02, macadan: 0.9, tierra: 0.78 } as const;
export const FACTOR_USO = { residencial: 1, comercial: 1.14, industrial: 1.08, turistico: 1.1, agricola: 0.96 } as const;

export const FACTOR_TIPO_CONSTRUCCION = {
  lujo_moderno: 1.22,
  residencial_alta: 1.12,
  residencial_media: 1,
  economica: 0.84,
} as const;

export const FACTOR_FLUJO_COMERCIAL = { alto: 1.2, medio: 1, bajo: 0.82 } as const;
export const FACTOR_VISIBILIDAD = { excelente: 1.14, buena: 1, regular: 0.88 } as const;
