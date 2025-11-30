'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './Navigation';
import { FlightCard } from './FlightCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { api } from '../../utils/api';

export function MyFlights({ user, onNavigate, onLogout }) {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/flights/');
      setFlights(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const handleAddFlight = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);
    try {
      await api.post('/flights/', {
        flight_number: flightNumber,
        date: flightDate
      });
      
      await fetchFlights(); 
      
      setFlightNumber('');
      setFlightDate('');
      toast.success('Flight added and is now being tracked!');

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteFlight = async (id) => {
    try {
      await api.delete(`/flights/${id}/`);

      toast.success('Flight removed');
      await fetchFlights();

    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-ios-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-400/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      </div>

      <Navigation user={user} currentPage="my-flights" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1E293B] mb-2">My Flights</h1>
          <p className="text-[#64748B]">Track and manage your upcoming flights</p>
        </div>

        {/* Add Flight Form */}
        <Card className="mb-8 border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-[#1E293B]">Track a New Flight</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFlight} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flight-number" className="text-[#1E293B]">Flight Number</Label>
                <Input
                  id="flight-number"
                  placeholder="e.g., AA123"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  required
                  className="bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flight-date" className="text-[#1E293B]">Date</Label>
                <Input
                  id="flight-date"
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  required
                  className="bg-white/50"
                />
              </div>
              <Button type="submit" className="md:self-end bg-[#007AFF] hover:bg-[#007AFF]/90 text-white" disabled={isAdding}>
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Flight'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Display Flights List */}
        <div className="space-y-4">
          {isLoading && (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          )}

          {!isLoading && error && (
            <Card className="border-red-200/50 bg-red-50/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="pt-6">
                <p className="text-center text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && flights.length === 0 && (
            <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="pt-6">
                <p className="text-center text-[#64748B]">You are not tracking any flights.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && flights.length > 0 && (
            flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onDelete={() => handleDeleteFlight(flight.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}