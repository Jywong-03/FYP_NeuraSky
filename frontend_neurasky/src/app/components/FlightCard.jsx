'use client'

import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plane, Clock, Calendar, ArrowRight, Trash2, MapPin, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import { API_BASE_URL } from '../config';



const AIRLINE_CODES = {
    'MH': 'Malaysia Airlines',
    'AK': 'AirAsia',
    'OD': 'Batik Air', 
    'SQ': 'Singapore Airlines',
    'CX': 'Cathay Pacific',
    'JL': 'Japan Airlines',
    'TR': 'Scoot',
    'EK': 'Emirates',
    'QR': 'Qatar Airways'
};

const AIRPORT_NAMES = {
    'KUL': 'Kuala Lumpur International',
    'PEN': 'Penang International',
    'BKI': 'Kota Kinabalu International',
    'KCH': 'Kuching International',
    'LGK': 'Langkawi International',
    'JHB': 'Senai International',
    'SIN': 'Singapore Changi',
    'HKG': 'Hong Kong International',
    'NRT': 'Narita International',
    'LHR': 'London Heathrow',
    'SYD': 'Sydney Kingsford Smith'
};

export function FlightCard({ flight, onDelete, showRemove = true }) {
    // Derive airline from flight number if backend info is missing
    const airlineName = flight.airline && flight.airline !== 'Unknown Airline' 
        ? flight.airline 
        : (AIRLINE_CODES[flight.flight_number?.substring(0,2)?.toUpperCase()] || 'Unknown Airline');

  // Helper function to format status
  const getStatusBadge = (status) => {
    const safeStatus = status?.toLowerCase() || 'unknown';

    if (safeStatus.includes('delayed')) {
      return <Badge className="bg-red-100 text-red-700 border-red-500/20 shadow-sm animate-pulse hover:bg-red-200">Delayed</Badge>;
    }
    if (safeStatus.includes('on-time') || safeStatus.includes('on time')) {
      return <Badge className="bg-green-100 text-green-700 border-green-500/20 shadow-sm hover:bg-green-200">On-Time</Badge>;
    }
    if (safeStatus.includes('scheduled')) {
      return <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Scheduled</Badge>;
    }
    return <Badge variant="outline" className="border-muted-foreground text-muted-foreground">{status || 'Unknown'}</Badge>;
  };

  // Helper function to format the date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      // Assuming timeString is in a format Date() can parse, like an ISO string
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Military/Digital time preferred for tech feel
      });
    } catch (e) {
      // Fallback for simple date strings
      return timeString.split('T')[1]?.substring(0, 5) || 'N/A';
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const flightDuration = calculateDuration(flight.departureTime, flight.arrivalTime);

  const handleAddToCalendar = () => {
    const startTime = flight.departureTime ? new Date(flight.departureTime).toISOString().replace(/-|:|\.\d\d\d/g, "") : "";
    const endTime = flight.arrivalTime ? new Date(flight.arrivalTime).toISOString().replace(/-|:|\.\d\d\d/g, "") : "";
    
    const title = `Flight ${flight.flight_number} to ${flight.destination}`;
    const desc = `Flight Number: ${flight.flight_number}\nTo: ${flight.destination}\nAirline: ${airlineName}\nStatus: ${flight.status}`;
    const loc = `${flight.origin} to ${flight.destination}`;
    
    // Create ICS content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.href}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${loc}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'flight.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Event downloaded to calendar");
  };

  const handleShare = () => {
    const text = `Tracking Flight ${flight.flight_number} with NeuraSky.\nStatus: ${flight.status}\nDeparture: ${formatTime(flight.departureTime)}\nTrack live: https://neurasky.click`;
    navigator.clipboard.writeText(text);
    toast.success("Flight status copied to clipboard");
  };

  const handleDownloadCertificate = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/flights/${flight.id}/certificate/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Delay_Certificate_${flight.flight_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Certificate downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download certificate. Please try again.");
    }
  };

  return (
    <Card className="mb-4 group hover:shadow-md transition-all duration-300 border border-border border-t-4 border-t-blue-500 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col gap-6">
          
          {/* Top Row: Flight Info & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-mono font-bold text-primary tracking-tighter">
                  {flight.flight_number?.toUpperCase() || 'N/A'}
                </span>
                {getStatusBadge(flight.status)}
                
                {/* Risk Badge (New Feature) */}
                {flight.risk_analysis && (
                   <div 
                     className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm transition-all hover:scale-105 cursor-help
                     ${flight.risk_analysis.risk_level === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 
                       flight.risk_analysis.risk_level === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                       'bg-blue-50 text-blue-700 border-blue-200'}
                     `}
                     title={`Forecast: ${flight.risk_analysis.probability}% chance of delay.\nFactors: ${flight.risk_analysis.is_peak ? 'Peak Hour' : ''} ${flight.risk_analysis.is_international ? 'International' : ''}`}
                   >
                     {flight.risk_analysis.risk_level === 'High' && <span className="relative flex h-2 w-2 mr-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
                     {flight.risk_analysis.risk_level} Risk
                   </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <span className="uppercase tracking-widest text-xs">{airlineName}</span>
                {flight.aircraft_type && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="font-mono text-xs text-foreground/70">{flight.aircraft_type}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
               <div className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-mono">{formatDate(flight.date)}</span>
               </div>
               <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-mono">{formatTime(flight.departureTime)}</span>
               </div>
            </div>
          </div>

          {/* Middle Row: Route & Gates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4 border-t border-dashed border-border relative">
            
            {/* Origin */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Origin
              </span>
              <span className="text-2xl font-black text-foreground tracking-tight">{flight.origin?.toUpperCase() || 'N/A'}</span>
              <div className="flex gap-2 mt-1">
                {flight.terminal && <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground border border-border">T-{flight.terminal}</span>}
                {flight.gate && <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground border border-border">G-{flight.gate}</span>}
              </div>
            </div>

            {/* Flight Path Visual */}
            <div className="flex flex-col items-center justify-center relative w-full px-4">
               <div className="w-full flex items-center gap-2 text-slate-300 relative">
                  {/* Digital Dash Line */}
                  <div className="h-px w-full bg-primary/20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-1 border border-primary/30 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)] z-10">
                      <Plane className="w-5 h-5 text-primary rotate-90" />
                    </div>
                  </div>
               </div>
               <span className="text-xs text-muted-foreground mt-4 font-medium font-mono flex flex-col items-center">
                 {flightDuration && <span className="mb-1 text-foreground font-semibold bg-muted/50 px-2 py-0.5 rounded">{flightDuration}</span>}
                 {flight.estimatedDelay > 0 
                   ? <span className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]">+{flight.estimatedDelay}m DELAY</span>
                   : <span className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">ON TIME</span>
                 }
               </span>
            </div>

            {/* Destination */}
            <div className="flex flex-col sm:items-end text-left sm:text-right">
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-1 flex items-center gap-1 sm:flex-row-reverse">
                <MapPin className="w-3 h-3" /> Destination
              </span>
              <span className="text-2xl font-black text-foreground tracking-tight">{flight.destination?.toUpperCase() || 'N/A'}</span>
              <span className="text-xs text-muted-foreground font-medium truncate max-w-[150px]">
                {AIRPORT_NAMES[flight.destination?.toUpperCase()] || 'Airport'}
              </span>
              <div className="flex items-center gap-2 justify-end mt-1 text-muted-foreground text-sm font-mono">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>{formatTime(flight.arrivalTime || flight.departureTime)}</span>
              </div>
              {flight.baggage_claim && <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground mt-1 border border-border">Carousel {flight.baggage_claim}</span>}
            </div>
          </div>

          {/* Bottom Row: Inbound Flight (Where's my plane?) */}
          {flight.inbound_flight_number && (
            <div className="bg-muted hover:bg-muted/80 transition-colors rounded-lg p-3 flex items-center justify-between border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Plane className="w-4 h-4 text-primary rotate-180" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Inbound Aircraft</span>
                  <span className="text-sm font-medium text-foreground tracking-tight">
                    {flight.inbound_flight_number} <span className="text-muted-foreground">from</span> {flight.inbound_origin}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                Track
              </Button>
            </div>
          )}

          {/* Actions */}
          {showRemove && (
            <div className="flex justify-end pt-2 border-t border-border gap-2">
                {flight.status === 'Delayed' && (
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCertificate}
                      className="text-blue-600 hover:bg-blue-50 border-blue-200"
                      title="Download Delay Certificate (Insurance)"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      Certificate
                  </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={handleAddToCalendar}
                    title="Add to Calendar"
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={handleShare}
                    title="Share Status"
                >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </Button>

                <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 group-hover:opacity-100 transition-all opacity-80"
                onClick={() => onDelete(flight.id)}
                >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Flight
                </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}