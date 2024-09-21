import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css'; 

const Map = () => {
  // Set the initial map view (latitude, longitude, zoom level)
  const [position, setPosition] = useState<[number, number]>([32.732, -97.115]);

  return (
    <div className="map">
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={true} 
        style={{ height: "100vh", width: "100%" }}
      >
        {/* TileLayer loads the map tiles from OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Marker shows the position on the map */}
        <Marker position={position}>
          <Popup>
            This is the campus location!
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
