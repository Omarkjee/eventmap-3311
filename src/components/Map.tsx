import { useState, useEffect } from 'react';
import {MapContainer, TileLayer, Marker, Popup, useMapEvents} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EventDetails } from '../utils/firebaseEvents'; // Adjust the path if needed


const Map = ({ events, selectedEventId, onMapClick, isDroppingPin }:
                 { events: Array<EventDetails>, selectedEventId: string | null, onMapClick: (coords: { lat: number, lng: number }) => void, isDroppingPin: boolean }) => {

  const [markers, setMarkers] = useState<Array<{ lat: number; lng: number }>>([]);


  // Custom icons for default and highlighted pins
  const defaultIcon = new L.Icon({
    iconUrl: 'path-to-default-pin.png',  // Replace with the actual path to default pin
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const highlightedIcon = new L.Icon({
    iconUrl: 'path-to-highlighted-pin.png',  // Replace with the actual path to highlighted pin
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Function to handle map clicks and drop pins
  const MapClickHandler = () => {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        if (isDroppingPin) {
          const { lat, lng } = e.latlng;
          setMarkers((prevMarkers) => [...prevMarkers, { lat, lng }]); // Add the new marker to the array
          onMapClick({ lat, lng });  // Pass the lat/lng to the parent (App)
        }
      }
    });
    return null;
  };

  useEffect(() => {
    if (selectedEventId) {
      const selectedEvent = events.find(event => event.id === selectedEventId);
      if (selectedEvent) {
        setMarkers([selectedEvent.latitude, selectedEvent.longitude]);
      }
    }
  }, [selectedEventId, events]);

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

          {/* Render markers for events */}
          {events.map(event => (
              <Marker
                  key={event.id}
                  position={[event.latitude, event.longitude]}
                  icon={event.id === selectedEventId ? highlightedIcon : defaultIcon}  // Highlight selected event's pin
              >
                <Popup>
                  {event.title}<br />
                  {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
                </Popup>
              </Marker>
          ))}

          {/* Render marker for manually dropped pin */}
          {markers.map((position, index) => (
              <Marker key={index} position={[position.lat, position.lng]}>
                <Popup>
                  Event location: {position.lat}, {position.lng}
                </Popup>
              </Marker>
          ))}


          {/* Handle map click events */}
          <MapClickHandler />
        </MapContainer>
      </div>
  );
};

export default Map;

