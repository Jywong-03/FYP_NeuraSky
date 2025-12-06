'use client'

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default icon not found in Next.js
const icon = L.icon({
  iconUrl: '/images/marker-icon.png', // We'll need to ensure these exist or use CDN
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Since we don't have local images yet, let's use CDN for the fix immediately
L.Marker.prototype.options.icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});


const AIRPORT_COORDINATES = {
  'KUL': [2.7456, 101.7072], // KLIA
  'PEN': [5.2923, 100.2748], // Penang
  'BKI': [5.9372, 116.0512], // Kota Kinabalu
  'KCH': [1.4851, 110.3471], // Kuching
  'LGK': [6.3297, 99.7344],  // Langkawi
  'JHB': [1.6368, 103.6697], // Senai (Johor)
  'SZB': [3.1313, 101.5467], // Subang
  'SIN': [1.3644, 103.9915], // Changi (Singapore)
};

function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function FlightMap({ origin, destination }) {
  const originCoords = AIRPORT_COORDINATES[origin];
  const destCoords = AIRPORT_COORDINATES[destination];

  console.log("FlightMap Rendering:", { origin, destination, originCoords, destCoords });

  if (!originCoords || !destCoords) {
    console.warn("FlightMap: Missing coordinates for", origin, destination);
    return <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">Map coordinates not available for {origin}-{destination}</div>;
  }

  const bounds = [originCoords, destCoords];
  const midpoint = [
    (originCoords[0] + destCoords[0]) / 2,
    (originCoords[1] + destCoords[1]) / 2
  ];

  return (
    <MapContainer 
      center={midpoint} 
      zoom={6} 
      scrollWheelZoom={false} 
      className="h-full w-full rounded-xl z-0"
      style={{ height: '100%', width: '100%', minHeight: '200px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={originCoords}>
        <Popup>Origin: {origin}</Popup>
      </Marker>
      <Marker position={destCoords}>
        <Popup>Destination: {destination}</Popup>
      </Marker>
      <Polyline positions={[originCoords, destCoords]} color="blue" dashArray="5, 10" />
      <ChangeView bounds={bounds} />
    </MapContainer>
  );
}
