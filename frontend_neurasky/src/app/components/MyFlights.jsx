'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './Navigation';
import { FlightCard } from './FlightCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Loader2, Plane } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { api } from '../../utils/api';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from './ui/utils';
export function MyFlights({ user, onNavigate, onLogout }) {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState(undefined);
  const [simulateDelay, setSimulateDelay] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Helper function to get today's date in YYYY-MM-DD format
  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch stored flights
      const storedFlights = await api.get('/flights/');
      
      // Since we are now in "Simulation Mode", the stored flights contain 
      // all the necessary simulated data (Status, Delay, Gate). 
      // We no longer need to fetch "live" data which might overwrite our demo scenarios.
      
      setFlights(storedFlights);
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
        date: flightDate ? format(flightDate, 'yyyy-MM-dd') : '',
        simulate_delay: simulateDelay 
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
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-background" />

      <Navigation user={user} currentPage="my-flights" onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Corporate Hero Header */}
      <div className="absolute top-0 w-full h-[300px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="bg-blue-900 text-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
             <Plane className="w-8 h-8" />
             My Flights
          </h1>
          <p className="text-blue-100 opacity-90">Track and manage your upcoming travel itinerary</p>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header content removed as it is now in the Hero Banner above */ }

        {/* Add Flight Form */}
        <Card className="mb-8 border border-border border-t-4 border-t-primary bg-white shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-foreground">Track a New Flight</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFlight} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flight-number" className="text-foreground">Flight Number</Label>
                <Input
                  id="flight-number"
                  placeholder="e.g., AA123"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  required
                  className="bg-white border-border text-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flight-date" className="text-foreground">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal border-border bg-white text-foreground hover:bg-gray-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-200",
                        !flightDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {flightDate ? format(flightDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={flightDate}
                      onSelect={setFlightDate}
                      initialFocus
                      className="bg-white border-border text-foreground"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              
              <div className="flex items-center space-x-2 md:col-span-3 md:justify-end">
                  <input 
                    type="checkbox" 
                    id="simulate-delay" 
                    checked={simulateDelay} 
                    onChange={(e) => setSimulateDelay(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="simulate-delay" className="text-sm text-muted-foreground font-medium cursor-pointer">
                    Simulate Delay (Demo Mode)
                  </Label>
              </div>

              <Button 
                type="submit" 
                className="md:col-span-3 md:ml-auto bg-blue-600! hover:bg-blue-700! text-white! font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-150 w-full md:w-auto" 
                disabled={isAdding}
              >
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Flight'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Display Flights List */}
        <div className="space-y-4">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full bg-muted" />
              <Skeleton className="h-32 w-full bg-muted" />
            </div>
          )}

          {!isLoading && error && (
            <Card className="border-red-500/20 bg-red-500/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="pt-6">
                <p className="text-center text-red-400">{error}</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && flights.length === 0 && (
            <Card className="border-border bg-card/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plane className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <p className="text-muted-foreground">You are not tracking any flights.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && flights.length > 0 && (
            <div className="space-y-4">
            <div className="space-y-4">
                {flights
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((flight) => (
                    <FlightCard
                        key={flight.id}
                        flight={flight}
                        onDelete={() => handleDeleteFlight(flight.id)}
                    />
                ))}
                
                {/* Pagination Controls */}
                {flights.length > itemsPerPage && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-24 bg-white hover:bg-gray-50 text-foreground border-border disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                      Page {currentPage} of {Math.ceil(flights.length / itemsPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(flights.length / itemsPerPage), p + 1))}
                      disabled={currentPage >= Math.ceil(flights.length / itemsPerPage)}
                      className="w-24 bg-white hover:bg-gray-50 text-foreground border-border disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
            </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}