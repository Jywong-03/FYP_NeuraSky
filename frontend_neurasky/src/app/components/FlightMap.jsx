'use client'

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default icon not found in Next.js
// Ideally, we'd use a custom "Digital" pin icon here
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = icon;


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

  if (!originCoords || !destCoords) {
    return <div className="h-full w-full flex items-center justify-center bg-card/20 text-muted-foreground border border-border rounded-xl">Map coordinates not available</div>;
  }

  const bounds = [originCoords, destCoords];
  const midpoint = [
    (originCoords[0] + destCoords[0]) / 2,
    (originCoords[1] + destCoords[1]) / 2
  ];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative">
        <MapContainer 
        center={midpoint} 
        zoom={6} 
        scrollWheelZoom={false} 
        className="h-full w-full z-0 bg-slate-950"
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        >
        {/* Dark Theme Tiles */}
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={originCoords}>
            <Popup className="text-black">Origin: {origin}</Popup>
        </Marker>
        <Marker position={destCoords}>
            <Popup className="text-black">Destination: {destination}</Popup>
        </Marker>
        <Polyline 
            positions={[originCoords, destCoords]} 
            pathOptions={{ color: '#06b6d4', dashArray: '10, 10', weight: 2, opacity: 0.8 }} 
        />
        <ChangeView bounds={bounds} />
        </MapContainer>
        
        {/* Decorative Overlay for "Tech" feel */}
        <div className="absolute top-4 right-4 z-400 bg-black/80 px-3 py-1 rounded text-xs font-mono text-primary border border-primary/30 pointer-events-none">
            LIVE SATELLITE FEED
        </div>
    </div>
  );
}
