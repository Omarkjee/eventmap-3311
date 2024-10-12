import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EventDetails } from '../utils/firebaseEvents'; // Adjust the path if needed
import {Box, Checkbox, FormControlLabel } from '@mui/material';

const Map = ({
               events,
               selectedEventId,
               onMapClick,
               isDroppingPin
             }: {
  events: Array<EventDetails>,
  selectedEventId: string | null,
  onMapClick: (coords: { lat: number, lng: number }) => void,
  isDroppingPin: boolean
}) => {
  const [markers, setMarkers] = useState<Array<{ lat: number; lng: number }>>([]);
  const [showPins, setShowPins] = useState(true);  // State for showing/hiding event pins
  const [selectedPin, setSelectedPin] = useState<string | null>(null);  // Keep track of the selected pin

  // Custom icons for default and highlighted pins
  const defaultIcon = new L.Icon.Default({
    iconUrl: 'path-to-default-pin.png',  // Replace with the actual path to default pin
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const highlightedIcon = new L.Icon({
    iconUrl: 'src/assets/yellowPin.png',  // Replace with the actual path to highlighted pin
    iconSize: [35, 41],
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
          // Replace the existing marker instead of adding a new one
          setMarkers([{ lat, lng }]); // Only allow one pin at a time
          onMapClick({ lat, lng });  // Pass the lat/lng to the parent (App)
        }
      }
    });
    return null;
  };

  // Effect to highlight the selected event pin when its ID is set
  useEffect(() => {
    if (selectedEventId) {
      const selectedEvent = events.find(event => event.id === selectedEventId);
      if (selectedEvent) {
        // Focus the map or highlight the marker for this event.
        setSelectedPin(selectedEvent.id);
      }
    }
  }, [selectedEventId, events]);

  return (
      <Box sx={{ position: 'relative' }}>
        {/* Checkbox to toggle event pin visibility, attached to top-right corner of the map */}
        <FormControlLabel
            control={<Checkbox checked={showPins} onChange={() => setShowPins(!showPins)} />}
            label="Show Event Pins"
            sx={{
              position: 'absolute',
              zIndex: 1000,
              top: 10,
              right: 10, // Changed to right corner
              backgroundColor: 'white', // Add some styling so the checkbox is visible on the map
              padding: '5px',
              borderRadius: '4px',
              boxShadow: 3
            }}
        />

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

          {/* Render markers for events only if showPins is true and we're not in pin-drop mode */}
          {showPins && !isDroppingPin && events.map(event => (
              <Marker
                  key={event.id}
                  position={[event.latitude, event.longitude]}
                  icon={event.id === selectedPin ? highlightedIcon : defaultIcon}  // Highlight selected event's pin
              >
                <Popup>
            <span
                onClick={() => setSelectedPin(event.id)}  // Set the pin as selected when clicked
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
            >
              {event.title}
            </span>
                  <br />
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
      </Box>
  );
};

export default Map;
