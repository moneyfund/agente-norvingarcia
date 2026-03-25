import L from 'leaflet';

const PROPERTY_MARKER_SVG = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="42" height="54" viewBox="0 0 42 54" fill="none">
    <path d="M21 1.5C11.0589 1.5 3 9.55887 3 19.5C3 33 21 52.5 21 52.5C21 52.5 39 33 39 19.5C39 9.55887 30.9411 1.5 21 1.5Z" fill="#F43F5E" stroke="white" stroke-width="2.5"/>
    <circle cx="21" cy="19.5" r="7" fill="white"/>
    <circle cx="21" cy="19.5" r="3.5" fill="#F43F5E"/>
  </svg>
`);

export const propertyMarkerIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${PROPERTY_MARKER_SVG}`,
  iconSize: [42, 54],
  iconAnchor: [21, 54],
  popupAnchor: [0, -50],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [50, 50],
  shadowAnchor: [15, 50],
});
