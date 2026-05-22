import { SERVICIO_PESO } from './weights';

export const sumServicios = (servicios: string[]) => 1 + servicios.reduce((a, s) => a + (SERVICIO_PESO[s as keyof typeof SERVICIO_PESO] ?? 0), 0);
export const range = (v: number) => ({ minimo: v * 0.93, maximo: v * 1.08 });
export const confidence = (coefCount: number) => coefCount >= 10 ? 'Alto' : coefCount >= 7 ? 'Medio' : 'Base';
