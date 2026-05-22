import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AvaluoReportView from '../components/avaluos/AvaluoReportView';
import { getAvaluoById } from '../services/avaluos.service';

export default function AvaluoDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    getAvaluoById(id).then(setItem);
  }, [id]);

  if (!item) return <main className='min-h-screen bg-slate-900 p-10 text-white'>Cargando informe...</main>;
  return <main className='min-h-screen bg-slate-900 px-4 py-10'><AvaluoReportView avaluo={item} /></main>;
}
