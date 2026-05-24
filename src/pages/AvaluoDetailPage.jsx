import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AvaluoReportView from '../components/avaluos/AvaluoReportView';
import { getAvaluoById } from '../services/avaluos.service';

export default function AvaluoDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('PARAM ID', id);

    let isMounted = true;

    const fetchAvaluo = async () => {
      try {
        if (!id) {
          if (isMounted) {
            setError('ID de avalúo inválido');
            setItem(null);
          }
          return;
        }

        if (isMounted) {
          setLoading(true);
          setError('');
        }

        const avaluo = await getAvaluoById(id);

        if (!isMounted) return;

        if (avaluo) {
          setItem(avaluo);
        } else {
          setItem(null);
          setError('Avalúo no encontrado');
        }
      } catch (fetchError) {
        console.error('Error cargando avalúo:', fetchError);
        if (isMounted) {
          setItem(null);
          setError('Error cargando informe');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAvaluo();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <main className='min-h-screen bg-slate-900 p-10 text-white'>Cargando informe...</main>;

  if (error) {
    return <main className='min-h-screen bg-slate-900 p-10 text-white'>{error}</main>;
  }

  return <main className='min-h-screen bg-slate-900 px-4 py-10'><AvaluoReportView avaluo={item} /></main>;
}
