import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Seo from '../components/Seo';
import { usePropiedades } from '../hooks/usePropiedades';

function MapPage() {
  const { propiedades, loading, error } = usePropiedades();
  const center = propiedades[0] ? [propiedades[0].lat, propiedades[0].lng] : [18.47, -69.93];

  return (
    <section className="section-container">
      <Seo title="Mapa de propiedades | Norvin García" description="Explora en un mapa interactivo las propiedades disponibles con Norvin García." />
      <h1 className="font-display text-4xl font-semibold">Mapa de propiedades</h1>
      {loading && <p className="mt-4 text-slate-500">Cargando mapa...</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-600">{error}</p>}
      <div className="mt-6 overflow-hidden rounded-2xl shadow-premium">
        <MapContainer center={center} zoom={8} style={{ height: '600px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {propiedades.map((property) => (
            <Marker key={property.id} position={[property.lat, property.lng]}>
              <Popup>
                <div className="space-y-2">
                  <strong>{property.titulo}</strong>
                  <p>{property.ubicacion}</p>
                  <Link to={`/propiedad/${property.id}`} className="text-brand-500">Ver detalle</Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

export default MapPage;
