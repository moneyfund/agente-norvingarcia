import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { propertyMarkerIcon } from '../utils/mapMarkers';

export default function PropertyLocation({ coordinates, title, zoom = 13, showMarker = true }) {
  return (
    <MapContainer className="ng-leaflet" center={coordinates} zoom={zoom} scrollWheelZoom={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {showMarker && <Marker position={coordinates} icon={propertyMarkerIcon}><Popup>{title}</Popup></Marker>}
    </MapContainer>
  );
}
