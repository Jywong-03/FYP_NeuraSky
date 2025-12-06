'use client'

import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plane, Clock, Calendar, ArrowRight, Trash2 } from 'lucide-react';

export function FlightCard({ flight, onDelete }) {

  // Helper function to format status
  const getStatusBadge = (status) => {
    const safeStatus = status?.toLowerCase() || 'unknown';

    if (safeStatus.includes('delayed')) {
      return <Badge variant="destructive">Delayed</Badge>;
    }
    if (safeStatus.includes('on-time')) {
      return <Badge className="bg-green-500 text-white">On-Time</Badge>;
    }
    if (safeStatus.includes('scheduled')) {
      return <Badge variant="secondary">Scheduled</Badge>;
    }
    return <Badge variant="outline">{status || 'Unknown'}</Badge>;
  };

  // Helper function to format the date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
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
        hour12: true,
      });
    } catch (e) {
      // Fallback for simple date strings
      return timeString.split('T')[1]?.substring(0, 5) || 'N/A';
    }
  };

  return (
    <Card className="mb-4 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 animate-in fade-in slide-in-from-bottom-4 bg-white dark:bg-slate-900">
      <CardContent className="p-5">
        <div className="flex flex-col gap-6">
          
          {/* Top Row: Flight Info & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {flight.flight_number?.toUpperCase() || 'N/A'}
                </span>
                {getStatusBadge(flight.status)}
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <span>{flight.airline || 'Unknown Airline'}</span>
                {flight.aircraft_type && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{flight.aircraft_type}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
               <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{formatDate(flight.date)}</span>
               </div>
               <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{formatTime(flight.departureTime)}</span>
               </div>
            </div>
          </div>

          {/* Middle Row: Route & Gates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4 border-t border-b border-slate-100 dark:border-slate-800">
            
            {/* Origin */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Origin</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{flight.origin?.toUpperCase() || 'N/A'}</span>
              {flight.terminal && <span className="text-sm text-slate-500">Term {flight.terminal}</span>}
              {flight.gate && <span className="text-sm text-slate-500">Gate {flight.gate}</span>}
            </div>

            {/* Flight Path Visual */}
            <div className="flex flex-col items-center justify-center">
               <div className="w-full flex items-center gap-2 text-slate-300">
                  <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-700 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 p-1">
                      <Plane className="w-5 h-5 text-blue-500 rotate-90" />
                    </div>
                  </div>
               </div>
               <span className="text-xs text-slate-400 mt-2 font-medium">
                 {flight.estimatedDelay > 0 
                   ? <span className="text-red-500">+{flight.estimatedDelay}m Late</span>
                   : <span className="text-green-500">On Time</span>
                 }
               </span>
            </div>

            {/* Destination */}
            <div className="flex flex-col sm:items-end text-left sm:text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Destination</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{flight.destination?.toUpperCase() || 'N/A'}</span>
              {flight.baggage_claim && <span className="text-sm text-slate-500">Baggage {flight.baggage_claim}</span>}
            </div>
          </div>

          {/* Bottom Row: Inbound Flight (Where's my plane?) */}
          {flight.inbound_flight_number && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400 rotate-180" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Inbound Flight</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {flight.inbound_flight_number} from {flight.inbound_origin}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                Track
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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