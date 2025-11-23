'use client'

import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plane, Clock, Calendar, ArrowRight, Trash2 } from 'lucide-react';

export function FlightCard({ flight, onDelete }) {

  // Helper function to format status
  const getStatusBadge = (status) => {
    // --- FIX 1: Add a null check for status ---
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
    <Card className="border-sky-100 transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          
          {/* Flight Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sky-900 font-semibold">
                {/* --- FIX 2: Add null check for flight_number --- */}
                {flight.flight_number?.toUpperCase() || 'N/A'}
              </span>
              {getStatusBadge(flight.status)}
            </div>
            <div className="flex items-center gap-2 text-sky-800">
              <span className="font-medium">
                {/* --- FIX 3: Add null check for origin --- */}
                {flight.origin?.toUpperCase() || 'N/A'}
              </span>
              <ArrowRight className="w-4 h-4 text-sky-500" />
              <span className="font-medium">
                {/* --- FIX 4: Add null check for destination --- */}
                {flight.destination?.toUpperCase() || 'N/A'}
              </span>
            </div>
          </div>

          {/* Time & Delay Info */}
          <div className="flex-1 mt-4 sm:mt-0 sm:text-right">
            <div className="flex items-center sm:justify-end gap-2 text-sky-900 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(flight.date)}</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{formatTime(flight.departureTime)}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-2 text-red-600">
              <Clock className="w-4 h-4" />
              <span>
                {flight.estimatedDelay > 0
                  ? `Estimated ${flight.estimatedDelay} min delay`
                  : 'No delay reported'}
              </span>
            </div>
          </div>

          {/* Delete Button */}
          <div className="sm:ml-4 mt-4 sm:mt-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-red-600 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}