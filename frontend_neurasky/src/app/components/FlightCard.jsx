'use client'

import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plane, Clock, Calendar, ArrowRight, Trash2, MapPin } from 'lucide-react';

export function FlightCard({ flight, onDelete }) {

  // Helper function to format status
  const getStatusBadge = (status) => {
    const safeStatus = status?.toLowerCase() || 'unknown';

    if (safeStatus.includes('delayed')) {
      return <Badge variant="destructive" className="animate-pulse shadow-sm border-red-500/50">Delayed</Badge>;
    }
    if (safeStatus.includes('on-time')) {
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
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <span className="uppercase tracking-widest text-xs">{flight.airline || 'Unknown Airline'}</span>
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
               <span className="text-xs text-muted-foreground mt-4 font-medium font-mono">
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
          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 group-hover:opacity-100 transition-all opacity-80"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Flight
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}