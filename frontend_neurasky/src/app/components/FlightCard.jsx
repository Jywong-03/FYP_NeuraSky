'use client'

import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Plane, Clock, AlertTriangle, MapPin } from 'lucide-react';

export function FlightCard({ flight, showActions, onRemove }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'boarding':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'departed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="border-sky-100 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sky-900">{flight.flightNumber}</h3>
                <p className="text-sky-600">{flight.airline}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-sky-500" />
                  <span className="text-sky-700">Route</span>
                </div>
                <p className="text-sky-900">{flight.origin} → {flight.destination}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-sky-500" />
                  <span className="text-sky-700">Departure</span>
                </div>
                <p className="text-sky-900">{formatTime(flight.departureTime)}</p>
              </div>
            </div>

            {flight.gate && (
              <div className="mt-3 flex gap-4">
                <span className="text-sky-600">Gate: <span className="text-sky-900">{flight.gate}</span></span>
                <span className="text-sky-600">Terminal: <span className="text-sky-900">{flight.terminal}</span></span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <Badge className={getStatusColor(flight.status)}>
              {flight.status.toUpperCase().replace('-', ' ')}
            </Badge>
            
            {flight.estimatedDelay > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Delayed {flight.estimatedDelay} min</span>
                </div>
                {flight.delayReason && (
                  <p className="text-sky-600 mt-1 max-w-xs">{flight.delayReason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
