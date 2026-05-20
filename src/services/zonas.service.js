import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const zonasCollection = collection(db, 'zonas');

export const getZonaReferencia = async ({ ciudad, zona }) => {
  const q = query(zonasCollection, where('ciudad', '==', ciudad), where('zona', '==', zona));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
};

export const seedZonasDemo = async () => {
  const base = [
    { ciudad: 'Matagalpa', zona: 'Molino Norte', clasificacion: 'A+', valorTerrenoM2: 220, valorConstruccionM2: 550, factorPlusvalia: 2 },
    { ciudad: 'Matagalpa', zona: 'Guanuca', clasificacion: 'A', valorTerrenoM2: 180, valorConstruccionM2: 480, factorPlusvalia: 1.7 },
    { ciudad: 'Matagalpa', zona: 'Parque Darío', clasificacion: 'B+', valorTerrenoM2: 145, valorConstruccionM2: 410, factorPlusvalia: 1.4 },
    { ciudad: 'Estelí', zona: 'Oscar Gámez', clasificacion: 'A+', valorTerrenoM2: 240, valorConstruccionM2: 590, factorPlusvalia: 2.1 },
    { ciudad: 'Estelí', zona: 'El Rosario', clasificacion: 'A', valorTerrenoM2: 190, valorConstruccionM2: 520, factorPlusvalia: 1.8 },
    { ciudad: 'Estelí', zona: 'La Thompson', clasificacion: 'B+', valorTerrenoM2: 160, valorConstruccionM2: 430, factorPlusvalia: 1.45 },
  ];

  await Promise.all(base.map((item) => addDoc(zonasCollection, item)));
};
