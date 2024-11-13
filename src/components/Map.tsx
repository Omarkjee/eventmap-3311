import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EventDetails } from '../utils/firebaseEvents';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import yellowPinUrl from '../assets/yellowPin.png';

const Map = ({
                 events,
                 selectedEventId,
                 onMapClick,
                 isDroppingPin,
                 markers,
                 setMarkers,
                 viewEvent,
                 clearDroppedPin,
             }: {
    events: Array<EventDetails>,
    selectedEventId: string | null,
    onMapClick: (coords: { lat: number, lng: number }) => void,
    isDroppingPin: boolean,
    viewEvent: (eventId: string) => void,
    markers: Array<{ lat: number; lng: number }>, // Receive markers
    setMarkers: React.Dispatch<React.SetStateAction<Array<{ lat: number; lng: number }>>>,
    clearDroppedPin: () => void
}) => {
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
        iconUrl: yellowPinUrl,  // Ensure this path is correct
        iconSize: [35, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    // This function handles map clicks when dropping a new pin
    const MapClickHandler = () => {
        useMapEvents({
            click(e: L.LeafletMouseEvent) {
                if (isDroppingPin) {
                    const { lat, lng } = e.latlng;
                    setMarkers([{ lat, lng }]); // Add dropped pin marker
                    onMapClick({ lat, lng }); // Callback for handling dropped pin coordinates
                }
            }
        });
        return null;
    };

    useEffect(() => {
        if (selectedEventId) {
            setSelectedPin(selectedEventId);
        } else {
            setSelectedPin(null); // Reset selected pin when not viewing an event
        }
    }, [selectedEventId, events]);

    useEffect(() => {
        if (!isDroppingPin && markers.length > 0) {
            clearDroppedPin(); // Clear the dropped pin when no longer in dropping state
        }
    }, [isDroppingPin, markers, clearDroppedPin]);

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
                    boxShadow: 3,
                }}
            />

            <MapContainer
                center={[32.728, -97.114]}
                zoom={16}
                minZoom={15}
                maxZoom={18}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                zoomControl={true}
                style={{ height: '100vh', width: '100%' }}
                maxBounds={[[32.722, -97.125], [32.742, -97.105]]}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {showPins &&
                    !isDroppingPin &&
                    events.map((event) => (
                        <Marker
                            key={event.id}
                            position={[event.latitude, event.longitude]}
                            icon={event.id === selectedEventId ? highlightedIcon : defaultIcon}// Highlight only the viewed event
                            eventHandlers={{
                                click: (e) => {
                                    setSelectedPin(event.id); // Ensure the popup stays open on click
                                    e.target.openPopup(); // Explicitly open the popup on click
                                },
                                mouseover: (e) => {
                                    if (event.id !== selectedPin) {
                                        e.target.openPopup(); // Show popup on mouseover
                                    }
                                },
                                mouseout: (e) => {
                                    if (event.id !== selectedPin) {
                                        e.target.closePopup(); // Hide popup on mouseout if not the selected pin
                                    }
                                },
                            }}
                        >
                            <Popup closeButton={true}>
                                <span
                                    onClick={() => viewEvent(event.id)} // Only navigate to ViewEvent when clicking the title
                                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                                >
                                    {event.title}
                                </span>
                                <br />
                                {new Date(event.start_time).toLocaleString()} -{' '}
                                {new Date(event.end_time).toLocaleString()}
                            </Popup>
                        </Marker>
                    ))}

                {/* Render dropped pin */}
                {markers.map((position, index) => (
                    <Marker key={index} position={[position.lat, position.lng]}>
                        <Popup>Event location: {position.lat}, {position.lng}</Popup>
                    </Marker>
                ))}

                <MapClickHandler />
            </MapContainer>
        </Box>
    );
};

export default Map;
