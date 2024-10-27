
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EventDetails } from '../utils/firebaseEvents';
import { Box, Checkbox, FormControlLabel } from '@mui/material';

const Map = ({
                 events,
                 selectedEventId,
                 onMapClick,
                 isDroppingPin,
                 viewEvent
             }: {
    events: Array<EventDetails>,
    selectedEventId: string | null,
    onMapClick: (coords: { lat: number, lng: number }) => void,
    isDroppingPin: boolean,
    viewEvent: (eventId: string) => void
}) => {
    const [markers, setMarkers] = useState<Array<{ lat: number; lng: number }>>([]);
    const [showPins, setShowPins] = useState(true);
    const [selectedPin, setSelectedPin] = useState<string | null>(null);

    // Custom icons for default and highlighted pins
    const defaultIcon = new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const highlightedIcon = new L.Icon({
        iconUrl: 'src/assets/yellowPin.png',
        iconSize: [35, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const MapClickHandler = () => {
        useMapEvents({
            click(e: L.LeafletMouseEvent) {
                if (isDroppingPin) {
                    const { lat, lng } = e.latlng;
                    setMarkers([{ lat, lng }]);
                    onMapClick({ lat, lng });
                }
            }
        });
        return null;
    };

    useEffect(() => {
        if (selectedEventId) {
            setSelectedPin(selectedEventId);
        }
    }, [selectedEventId, events]);

    return (
        <Box sx={{ position: 'relative' }}>
            <FormControlLabel
                control={<Checkbox checked={showPins} onChange={() => setShowPins(!showPins)} />}
                label="Show Event Pins"
                sx={{
                    position: 'absolute',
                    zIndex: 1000,
                    top: 10,
                    right: 10,
                    backgroundColor: 'white',
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

                {showPins && !isDroppingPin && events.map(event => (
                    <Marker
                        key={event.id}
                        position={[event.latitude, event.longitude]}
                        icon={event.id === selectedPin ? highlightedIcon : defaultIcon}
                        eventHandlers={{
                            click: (e) => {
                                setSelectedPin(event.id);
                                e.target.openPopup();  // Explicitly open the popup on click
                            },
                            mouseover: (e) => {
                                if (event.id !== selectedPin) {
                                    e.target.openPopup();
                                }
                            },
                            mouseout: (e) => {
                                if (event.id !== selectedPin) {
                                    e.target.closePopup();
                                }
                            }
                        }}
                    >
                        <Popup closeButton={true}>
                <span
                    onClick={() => viewEvent(event.id)}
                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                >
                  {event.title}
                </span>
                            <br />
                            {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
                        </Popup>
                    </Marker>
                ))}

                {markers.map((position, index) => (
                    <Marker key={index} position={[position.lat, position.lng]}>
                        <Popup>
                            Event location: {position.lat}, {position.lng}
                        </Popup>
                    </Marker>
                ))}

                <MapClickHandler />
            </MapContainer>
        </Box>
    );
};

export default Map;
