import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
//import './Map.css';

const Map = ({ onMapClick, isDroppingPin }: { onMapClick: (coords: { lat: number, lng: number }) => void, isDroppingPin: boolean }) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  const MapClickHandler = () => {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {  // Ensure `e` is typed correctly for Leaflet events
        if (isDroppingPin) {
          const { lat, lng } = e.latlng;
          setMarkerPosition([lat, lng]);  // Set marker position when clicked
          onMapClick({ lat, lng });  // Pass the lat/lng to the parent (App)
        }
      }
    });
    return null;
  };

  return (
    <div className="map">
      <MapContainer 
        center={[32.732, -97.115]} 
        zoom={16} 
        scrollWheelZoom={true} 
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render marker if a position is available */}
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>
              Event location: {markerPosition[0]}, {markerPosition[1]}
            </Popup>
          </Marker>
        )}

        {/* Handle map click events */}
        <MapClickHandler />
      </MapContainer>
    </div>
  );
};

export default Map;
