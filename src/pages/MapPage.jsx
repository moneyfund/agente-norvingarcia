import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Seo from '../components/Seo';
import { usePropiedades } from '../hooks/usePropiedades';

const DEFAULT_CENTER_NICARAGUA = [12.8654, -85.2072];

const redMarkerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30],
});

const hasValidCoordinates = (property) => {
  const lat = Number(property?.lat);
  const lng = Number(property?.lng);

  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= -90
    && lat <= 90
    && lng >= -180
    && lng <= 180;
};

function FitBounds({ properties }) {
  const map = useMap();

  useEffect(() => {
    if (!properties.length) return;

    const bounds = properties.map((property) => [Number(property.lat), Number(property.lng)]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, properties]);

  return null;
}

function MapPage() {
  const { propiedades, loading, error } = usePropiedades();

  const propertiesWithCoordinates = useMemo(
    () => propiedades.filter(hasValidCoordinates),
    [propiedades],
  );

  return (
    <section className="section-container">
      <Seo title="Mapa de propiedades | Norvin García" description="Explora en un mapa interactivo las propiedades disponibles con Norvin García." />
      <h1 className="font-display text-4xl font-semibold">Mapa de propiedades</h1>
      {loading && <p className="mt-4 text-slate-500">Cargando mapa...</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-600">{error}</p>}
      {!loading && !error && !propertiesWithCoordinates.length && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-amber-700">
          No hay propiedades con coordenadas válidas para mostrar en el mapa.
        </p>
      )}
      <div className="mt-6 overflow-hidden rounded-2xl shadow-premium">
        <MapContainer center={DEFAULT_CENTER_NICARAGUA} zoom={7} style={{ height: '600px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds properties={propertiesWithCoordinates} />
          {propertiesWithCoordinates.map((property) => (
            <Marker key={property.id} position={[Number(property.lat), Number(property.lng)]} icon={redMarkerIcon}>
              <Popup>
                <div className="space-y-2">
                  <strong>{property.titulo}</strong>
                  <p>{property.ubicacion}</p>
                  <p>{property.precio}</p>
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
