'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

// 1. Airport Coordinates (Lat, Lng)
const AIRPORT_COORDS = {
  'KUL': [2.7456, 101.7072], // Kuala Lumpur
  'PEN': [5.2925, 100.2662], // Penang
  'BKI': [5.9372, 116.0512], // Kota Kinabalu
  'KCH': [1.4847, 110.3472], // Kuching
  'LGK': [6.3297, 99.7287], // Langkawi
  'JHB': [1.6413, 103.6698], // Johor Bahru
  'SIN': [1.3644, 103.9915], // Singapore
  'HKG': [22.3080, 113.9185], // Hong Kong
  'NRT': [35.7720, 140.3929], // Tokyo Narita
  'LHR': [51.4700, -0.4543], // London Heathrow
  'SYD': [-33.9399, 151.1753], // Sydney
  'DXB': [25.2532, 55.3657], // Dubai
};

// Custom Plane Icon
const planeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/723/723955.png', // Fallback or use local
    // Let's use a standard color marker with rotation if possible, but for now simple marker
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

export default function LiveFlightMap({ flights: userFlights = [] }) {
  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    fixLeafletIcons();
    
    // Animation loop (update every 1 second)
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Filter flights that are currently "Active" (Departed but not yet Arrived)
  // For simulation, we will show them even if scheduled today to make it look alive.
  // We will calculate position based on % of time elapsed.
  
  const mapData = userFlights.map((flight, index) => {
    const origin = flight.origin || 'KUL';
    const dest = flight.destination || 'SIN';
    
    const startCoords = AIRPORT_COORDS[origin] || AIRPORT_COORDS['KUL'];
    const endCoords = AIRPORT_COORDS[dest] || AIRPORT_COORDS['SIN'];
    
    // DEMO MODE LOGIC
    if (isDemoMode) {
        // Create a staggered animation based on index
        // Loop duration: 60 seconds
        const loopDuration = 60000;
        const now = currentTime.getTime();
        // Stagger flights so they don't all move in sync
        const offset = index * (loopDuration / (userFlights.length || 1));
        const progressRaw = ((now + offset) % loopDuration) / loopDuration;
        
        let progress = progressRaw;
        // Optional: Make them pause at dest for a moment? No, continuous is better for demo.
        
        // Linear interpolation
        const lat = startCoords[0] + (endCoords[0] - startCoords[0]) * progress;
        const lng = startCoords[1] + (endCoords[1] - startCoords[1]) * progress;
        
        return {
            ...flight,
            startCoords,
            endCoords,
            currentPos: [lat, lng],
            progress,
            statusLabel: "Demo Flight",
            status: "In Air"
        };
    }

    if (!flight.departureTime || !flight.arrivalTime) {
        // If no times, just place it at origin or default
        return { 
            ...flight, 
            startCoords: startCoords || [0,0],
            endCoords: endCoords || [0,0],
            currentPos: startCoords || [0,0], 
            progress: 0,
            statusLabel: "Scheduled" 
        };
    }
    
    const depTime = new Date(flight.departureTime).getTime();
    const arrTime = new Date(flight.arrivalTime).getTime();
    const now = currentTime.getTime();
    
    let progress = 0;
    let currentPos = startCoords;
    let statusLabel = flight.status;
    
    if (now < depTime) {
        progress = 0;
        currentPos = startCoords;
        statusLabel = "Scheduled";
    } else if (now > arrTime) {
        progress = 1;
        currentPos = endCoords;
        statusLabel = "Arrived";
    } else {
        // In flight
        const totalDuration = arrTime - depTime;
        const elapsed = now - depTime;
        progress = elapsed / totalDuration;
        
    // Safety check
    if (!startCoords || !endCoords) {
        return { 
            ...flight, 
            startCoords: startCoords || [0,0], 
            endCoords: endCoords || [0,0], 
            currentPos: [0, 0], 
            progress: 0,
            statusLabel: "Unknown Route"
        };
    }
    
    // Linear interpolation
    const lat = startCoords[0] + (endCoords[0] - startCoords[0]) * progress;
    const lng = startCoords[1] + (endCoords[1] - startCoords[1]) * progress;
    currentPos = [lat, lng];
    statusLabel = "In Flight";
    }
    
    return {
        ...flight,
        startCoords,
        endCoords,
        currentPos,
        progress,
        statusLabel
    };
  });

  // Default center: Malaysia
  const position = [4.2105, 101.9758]; 

  return (
    <div className="w-full h-full relative z-0"> 
       <MapContainer 
        center={position} 
        zoom={5} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapData.map((flight) => (
          <React.Fragment key={flight.id}>
             {/* Draw line between origin and dest */}
             <Polyline 
                positions={[flight.startCoords, flight.endCoords]} 
                color={flight.progress > 0 && flight.progress < 1 ? "#3b82f6" : "#cbd5e1"} 
                dashArray={flight.progress > 0 && flight.progress < 1 ? "" : "5, 10"}
                weight={2}
             />
             
             {/* Plane Marker */}
             <Marker position={flight.currentPos} icon={planeIcon}>
                <Popup>
                    <div className="text-sm font-sans">
                        <strong className="block text-indigo-700">{flight.flight_number}</strong>
                        <div className="text-xs text-slate-500 mb-1">{flight.origin} ➝ {flight.destination}</div>
                        <div className={`
                            inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                            ${flight.status === 'Delayed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                        `}>
                            {flight.status || 'Scheduled'}
                        </div>
                        <div className="mt-1 text-xs">
                             Status: {flight.statusLabel}
                        </div>
                    </div>
                </Popup>
             </Marker>
          </React.Fragment>
        ))}
        
        <div className="leaflet-bottom leaflet-right m-4 z-[1000] flex flex-col gap-2 items-end pointer-events-auto">
            {/* Demo Toggle */}
            <div 
                className="bg-white/95 p-3 rounded-lg shadow-lg border border-slate-200 backdrop-blur-sm cursor-default"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-800">Simulation Mode</span>
                        <span className="text-[10px] text-slate-500">Force active flights</span>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDemoMode(!isDemoMode);
                        }}
                        className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                            ${isDemoMode ? 'bg-indigo-600' : 'bg-slate-200'}
                        `}
                    >
                        <span
                            className={`
                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                ${isDemoMode ? 'translate-x-6' : 'translate-x-1'}
                            `}
                        />
                    </button>
                </div>
            </div>

           <div className="bg-white/90 p-2 rounded shadow text-xs border border-slate-200 text-right">
              <strong>{isDemoMode ? "DEMO ACTIVE" : "LIVE TRACKING"}</strong>
              <br/>
              Tracking {userFlights.length} flights
           </div>
        </div>
      </MapContainer>
    </div>
  );
}
