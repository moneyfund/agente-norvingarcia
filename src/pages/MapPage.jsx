import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Seo from '../components/Seo';
import { properties } from '../data/properties';

function MapPage() {
  return (
    <section className="section-container">
      <Seo title="Mapa de propiedades | Norvin García" description="Explora en un mapa interactivo las propiedades disponibles con Norvin García." />
      <h1 className="font-display text-4xl font-semibold">Mapa de propiedades</h1>
      <div className="mt-6 overflow-hidden rounded-2xl shadow-premium">
        <MapContainer center={[18.47, -69.93]} zoom={8} style={{ height: '600px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {properties.map((property) => (
            <Marker key={property.id} position={[property.lat, property.lng]}>
              <Popup>
                <div className="space-y-2">
                  <strong>{property.title}</strong>
                  <p>{property.location}</p>
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
